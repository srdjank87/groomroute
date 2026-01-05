import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Suggest a service area for a new customer based on their zip code.
 *
 * This analyzes existing customers in each area to build a "zip code profile"
 * for each area, then suggests the best matching area for the new customer.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;
    const { searchParams } = new URL(req.url);
    const zipCode = searchParams.get("zipCode");

    if (!zipCode) {
      return NextResponse.json(
        { error: "zipCode parameter is required" },
        { status: 400 }
      );
    }

    // Get all service areas with their customers' zip codes
    const areas = await prisma.serviceArea.findMany({
      where: {
        accountId,
        isActive: true,
      },
      include: {
        customers: {
          select: {
            zipCode: true,
          },
          where: {
            zipCode: { not: null },
          },
        },
        _count: {
          select: { customers: true },
        },
      },
    });

    if (areas.length === 0) {
      return NextResponse.json({
        success: true,
        suggestion: null,
        reason: "No service areas defined yet",
      });
    }

    // Build zip code profiles for each area
    const areaProfiles = areas.map((area) => {
      const zipCodes = area.customers
        .map((c) => c.zipCode)
        .filter((z): z is string => z !== null);

      // Count occurrences of each zip code
      const zipCodeCounts: Record<string, number> = {};
      for (const zip of zipCodes) {
        zipCodeCounts[zip] = (zipCodeCounts[zip] || 0) + 1;
      }

      return {
        id: area.id,
        name: area.name,
        color: area.color,
        customerCount: area._count.customers,
        zipCodes: zipCodeCounts,
        uniqueZipCodes: Object.keys(zipCodeCounts),
      };
    });

    // Score each area based on how well the zip code matches
    const scoredAreas = areaProfiles
      .map((area) => {
        let score = 0;
        let matchType: "exact" | "prefix" | "nearby" | "none" = "none";

        // Exact match - customer zip code is already in this area
        if (area.zipCodes[zipCode]) {
          score = 100 + area.zipCodes[zipCode]; // Bonus for more customers with same zip
          matchType = "exact";
        } else {
          // Check for prefix match (same zip code prefix = nearby area)
          // US zip codes: first 3 digits = sectional center facility (regional)
          const inputPrefix = zipCode.substring(0, 3);

          for (const areaZip of area.uniqueZipCodes) {
            const areaPrefix = areaZip.substring(0, 3);

            if (areaPrefix === inputPrefix) {
              // Same regional area - good match
              const prefixScore = 50 + (area.zipCodes[areaZip] || 0);
              if (prefixScore > score) {
                score = prefixScore;
                matchType = "prefix";
              }
            } else {
              // Check numeric proximity (adjacent zip codes)
              const inputNum = parseInt(zipCode, 10);
              const areaNum = parseInt(areaZip, 10);
              const distance = Math.abs(inputNum - areaNum);

              // If zip codes are within 100 of each other, consider them nearby
              if (distance <= 100) {
                const proximityScore = 25 - (distance / 10); // Closer = higher score
                if (proximityScore > score) {
                  score = proximityScore;
                  matchType = "nearby";
                }
              }
            }
          }
        }

        return {
          ...area,
          score,
          matchType,
        };
      })
      .filter((area) => area.score > 0)
      .sort((a, b) => b.score - a.score);

    // Return the best suggestion
    if (scoredAreas.length === 0) {
      return NextResponse.json({
        success: true,
        suggestion: null,
        reason: "No matching areas found for this zip code",
        allAreas: areaProfiles.map((a) => ({
          id: a.id,
          name: a.name,
          color: a.color,
          customerCount: a.customerCount,
        })),
      });
    }

    const bestMatch = scoredAreas[0];

    // Build explanation
    let reason = "";
    switch (bestMatch.matchType) {
      case "exact":
        const sameZipCount = bestMatch.zipCodes[zipCode] || 0;
        reason = `${sameZipCount} other customer${sameZipCount !== 1 ? "s" : ""} in ${bestMatch.name} share${sameZipCount === 1 ? "s" : ""} this zip code`;
        break;
      case "prefix":
        reason = `This zip code is in the same region as other ${bestMatch.name} customers`;
        break;
      case "nearby":
        reason = `This zip code is near other ${bestMatch.name} customers`;
        break;
    }

    return NextResponse.json({
      success: true,
      suggestion: {
        id: bestMatch.id,
        name: bestMatch.name,
        color: bestMatch.color,
        customerCount: bestMatch.customerCount,
        confidence: bestMatch.matchType,
        score: bestMatch.score,
      },
      reason,
      alternatives: scoredAreas.slice(1, 3).map((a) => ({
        id: a.id,
        name: a.name,
        color: a.color,
        customerCount: a.customerCount,
      })),
    });
  } catch (error) {
    console.error("Error suggesting area:", error);
    return NextResponse.json(
      { error: "Failed to suggest area" },
      { status: 500 }
    );
  }
}
