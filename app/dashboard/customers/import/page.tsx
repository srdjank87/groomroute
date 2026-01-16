"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Users,
  PawPrint,
} from "lucide-react";
import toast from "react-hot-toast";

interface ParsedRow {
  clientName: string;
  phone: string;
  email: string;
  address: string;
  petName: string;
  species: string;
  breed: string;
  weight: string;
  notes: string;
}

interface ImportPreview {
  clients: {
    name: string;
    phone: string;
    email: string;
    address: string;
    pets: {
      name: string;
      species: string;
      breed: string;
      weight: number | null;
      notes: string;
    }[];
  }[];
  errors: string[];
  warnings: string[];
}

type ImportStep = "upload" | "preview" | "importing" | "complete";

export default function ImportCustomersPage() {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    clientsCreated: number;
    petsCreated: number;
    skipped: number;
  } | null>(null);

  const downloadTemplate = () => {
    const headers = [
      "client_name",
      "phone",
      "email",
      "address",
      "pet_name",
      "species",
      "breed",
      "weight_lbs",
      "notes",
    ];
    const exampleRows = [
      [
        "Sarah Johnson",
        "(555) 123-4567",
        "sarah@email.com",
        "123 Oak Street, Austin, TX 78701",
        "Max",
        "Dog",
        "Golden Retriever",
        "65",
        "Friendly, loves treats",
      ],
      [
        "Sarah Johnson",
        "(555) 123-4567",
        "sarah@email.com",
        "123 Oak Street, Austin, TX 78701",
        "Bella",
        "Dog",
        "Poodle",
        "45",
        "Nervous around loud noises",
      ],
      [
        "Mike Chen",
        "(555) 987-6543",
        "mike.chen@email.com",
        "456 Maple Ave, Austin, TX 78702",
        "Whiskers",
        "Cat",
        "Persian",
        "12",
        "",
      ],
    ];

    const csvContent = [
      headers.join(","),
      ...exampleRows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "groomroute_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) return [];

    // Parse header to find column indices
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map((h) =>
      h.toLowerCase().trim().replace(/[^a-z0-9_]/g, "_")
    );

    const columnMap: Record<string, number> = {};
    const possibleNames: Record<string, string[]> = {
      clientName: ["client_name", "name", "customer_name", "customer", "client"],
      phone: ["phone", "phone_number", "telephone", "mobile", "cell"],
      email: ["email", "email_address", "e_mail"],
      address: ["address", "street_address", "full_address", "location"],
      petName: ["pet_name", "pet", "animal_name", "animal"],
      species: ["species", "type", "animal_type", "pet_type"],
      breed: ["breed", "pet_breed"],
      weight: ["weight", "weight_lbs", "lbs", "pounds"],
      notes: ["notes", "comments", "special_notes", "grooming_notes"],
    };

    for (const [field, possibles] of Object.entries(possibleNames)) {
      for (const possible of possibles) {
        const idx = headers.indexOf(possible);
        if (idx !== -1) {
          columnMap[field] = idx;
          break;
        }
      }
    }

    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.every((v) => !v.trim())) continue;

      rows.push({
        clientName: values[columnMap.clientName] || "",
        phone: values[columnMap.phone] || "",
        email: values[columnMap.email] || "",
        address: values[columnMap.address] || "",
        petName: values[columnMap.petName] || "",
        species: values[columnMap.species] || "",
        breed: values[columnMap.breed] || "",
        weight: values[columnMap.weight] || "",
        notes: values[columnMap.notes] || "",
      });
    }

    return rows;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        toast.error("No data found in file");
        setIsProcessing(false);
        return;
      }

      // Group rows by client (using name + phone or name + email as key)
      const clientMap = new Map<
        string,
        {
          name: string;
          phone: string;
          email: string;
          address: string;
          pets: {
            name: string;
            species: string;
            breed: string;
            weight: number | null;
            notes: string;
          }[];
        }
      >();

      const errors: string[] = [];
      const warnings: string[] = [];

      rows.forEach((row, index) => {
        const rowNum = index + 2; // +2 for header and 0-index

        if (!row.clientName.trim()) {
          errors.push(`Row ${rowNum}: Missing client name`);
          return;
        }

        if (!row.address.trim()) {
          warnings.push(`Row ${rowNum}: Missing address for ${row.clientName}`);
        }

        // Create unique key for client
        const clientKey = `${row.clientName.toLowerCase()}|${row.phone || row.email}`.toLowerCase();

        if (!clientMap.has(clientKey)) {
          clientMap.set(clientKey, {
            name: row.clientName.trim(),
            phone: row.phone.trim(),
            email: row.email.trim(),
            address: row.address.trim(),
            pets: [],
          });
        }

        const client = clientMap.get(clientKey)!;

        // Add pet if pet name exists
        if (row.petName.trim()) {
          const weight = parseFloat(row.weight);
          client.pets.push({
            name: row.petName.trim(),
            species: row.species.trim() || "Dog",
            breed: row.breed.trim(),
            weight: isNaN(weight) ? null : weight,
            notes: row.notes.trim(),
          });
        }
      });

      const clients = Array.from(clientMap.values());

      if (clients.length === 0) {
        errors.push("No valid clients found in file");
      }

      setPreview({ clients, errors, warnings });
      setStep("preview");
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Failed to parse file");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        !selectedFile.name.endsWith(".csv") &&
        !selectedFile.type.includes("csv")
      ) {
        toast.error("Please upload a CSV file");
        return;
      }
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        if (
          !droppedFile.name.endsWith(".csv") &&
          !droppedFile.type.includes("csv")
        ) {
          toast.error("Please upload a CSV file");
          return;
        }
        setFile(droppedFile);
        processFile(droppedFile);
      }
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleImport = async () => {
    if (!preview || preview.errors.length > 0) return;

    setStep("importing");
    try {
      const response = await fetch("/api/customers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: preview.clients }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Import failed");
      }

      const result = await response.json();
      setImportResult(result);
      setStep("complete");
      toast.success("Import complete!");
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Import failed");
      setStep("preview");
    }
  };

  const resetImport = () => {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setImportResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Import Clients</h1>
            <p className="text-gray-600">
              Upload a CSV file to import your existing clients
            </p>
          </div>
        </div>
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-2">
              1. Download Template (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Start with our template to ensure your data is formatted correctly.
              You can also use exports from MoeGo or other grooming software.
            </p>
            <button
              onClick={downloadTemplate}
              className="btn btn-outline gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-2">
              2. Upload Your File
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file with your client and pet data. Multiple pets per
              client should be on separate rows.
            </p>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#A5744A] transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <span className="loading loading-spinner loading-lg text-[#A5744A]"></span>
                  <p className="text-gray-600">Processing file...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">
                    Drop your CSV file here
                  </p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </>
              )}
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Format Help */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-medium text-amber-800 mb-2">
              Supported Column Names
            </h3>
            <div className="text-sm text-amber-700 space-y-1">
              <p>
                <strong>Client:</strong> client_name, phone, email, address
              </p>
              <p>
                <strong>Pet:</strong> pet_name, species, breed, weight_lbs, notes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && preview && (
        <div className="space-y-6">
          {/* Errors */}
          {preview.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 mb-2">
                    Errors Found ({preview.errors.length})
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {preview.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {preview.errors.length > 5 && (
                      <li>...and {preview.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {preview.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 mb-2">
                    Warnings ({preview.warnings.length})
                  </h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {preview.warnings.slice(0, 3).map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                    {preview.warnings.length > 3 && (
                      <li>...and {preview.warnings.length - 3} more warnings</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Import Summary</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">
                  {preview.clients.length}
                </div>
                <div className="text-sm text-blue-700">Clients</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <PawPrint className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-900">
                  {preview.clients.reduce((sum, c) => sum + c.pets.length, 0)}
                </div>
                <div className="text-sm text-amber-700">Pets</div>
              </div>
            </div>

            {/* Client Preview List */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {preview.clients.slice(0, 10).map((client, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {client.name}
                      </div>
                      {client.phone && (
                        <div className="text-sm text-gray-600">
                          {client.phone}
                        </div>
                      )}
                      {client.address && (
                        <div className="text-sm text-gray-500">
                          {client.address}
                        </div>
                      )}
                    </div>
                    {client.pets.length > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-amber-700 font-medium">
                          {client.pets.map((p) => p.name).join(", ")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {client.pets.length} pet
                          {client.pets.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {preview.clients.length > 10 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  ...and {preview.clients.length - 10} more clients
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={resetImport} className="btn btn-outline flex-1">
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={preview.errors.length > 0}
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white flex-1 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Import {preview.clients.length} Clients
            </button>
          </div>
        </div>
      )}

      {/* Step: Importing */}
      {step === "importing" && (
        <div className="bg-white rounded-xl border p-12 text-center">
          <span className="loading loading-spinner loading-lg text-[#A5744A] mb-4"></span>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Importing...
          </h2>
          <p className="text-gray-600">
            Please wait while we import your clients and pets.
          </p>
        </div>
      )}

      {/* Step: Complete */}
      {step === "complete" && importResult && (
        <div className="bg-white rounded-xl border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Import Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            Successfully imported {importResult.clientsCreated} clients and{" "}
            {importResult.petsCreated} pets.
            {importResult.skipped > 0 && (
              <span className="block text-sm text-amber-600 mt-1">
                {importResult.skipped} duplicate entries were skipped.
              </span>
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={resetImport} className="btn btn-outline">
              Import More
            </button>
            <Link
              href="/dashboard/customers"
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white"
            >
              View Clients
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
