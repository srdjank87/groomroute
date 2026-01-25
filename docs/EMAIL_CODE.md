# GroomRoute Email Templates for Loops

This file contains HTML email templates that can be copied directly into the Loops email designer. Each template matches the GroomRoute brand design used in our Resend transactional emails.

**Note:** Founder/personal emails are intentionally plain text for authenticity and are not included here.

---

## Template Base Structure

All emails use this base structure. The content section changes per email.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">
              <!-- EMAIL CONTENT GOES HERE -->
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Sequence 0: Abandoned Checkout

### Email 1: 1 Hour After Signup - You're almost there!

**Subject:** You're almost there, {{firstName}}!

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">You're almost there!</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                You started signing up for GroomRoute but didn't quite finish. No worries - your spot is saved!
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>Your free trial is just one click away.</strong>
              </p>

              <!-- Benefits Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">Complete your signup now and get:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #8B6239; font-size: 15px;">14 days of full access — no charge today, you won't be billed until your trial ends</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #8B6239; font-size: 15px;">Route optimization to save hours every week</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #8B6239; font-size: 15px;">Client management that actually makes sense</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #8B6239; font-size: 15px;">The calm, organized days you deserve</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/signup?email={{email}}" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Complete Your Free Trial
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0; text-align: center;">
                It takes less than 60 seconds to finish.
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                See you inside!
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

              <p style="color: #6b7280; font-size: 14px; line-height: 22px; margin: 24px 0 0; font-style: italic;">
                <strong>P.S.</strong> Have questions before signing up? Just reply to this email - we're happy to help.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 2: Day 1 - Still thinking about it?

**Subject:** Still thinking about it?

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Still thinking about it?</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                We noticed you started signing up for GroomRoute yesterday but haven't finished yet.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>Here's what other mobile groomers are saying:</strong>
              </p>

              <!-- Testimonials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0 0 16px 0; font-style: italic;">
                      "I used to spend 45 minutes every morning figuring out my route. Now it takes me 30 seconds."
                    </p>
                    <p style="color: #1a1a1a; font-size: 14px; font-weight: 600; margin: 0;">— Sarah M.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 24px 20px;">
                    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 0 0 16px 0;">
                    <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0 0 16px 0; font-style: italic;">
                      "I finally have time to eat lunch between appointments."
                    </p>
                    <p style="color: #1a1a1a; font-size: 14px; font-weight: 600; margin: 0;">— Mike T.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 24px 20px;">
                    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 0 0 16px 0;">
                    <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0 0 16px 0; font-style: italic;">
                      "My clients love that I'm never late anymore."
                    </p>
                    <p style="color: #1a1a1a; font-size: 14px; font-weight: 600; margin: 0;">— Jennifer K.</p>
                  </td>
                </tr>
              </table>

              <!-- Highlight Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px; text-align: center;">
                    <p style="color: #166534; font-size: 16px; line-height: 24px; margin: 0;">
                      Your trial is completely <strong>free for 14 days</strong>. No tricks, no hassle.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/signup?email={{email}}" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Start My Free Trial
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                If something's holding you back, just reply to this email. I'd love to help.
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 4: Day 7 - Final reminder (Email 3 is founder email - plain text)

**Subject:** Last check-in about your GroomRoute trial

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Last check-in</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                This is my last email about your GroomRoute signup.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                I won't keep filling your inbox, but I wanted to reach out one more time in case you're still on the fence.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>Before you go, here's what you'd be getting:</strong>
              </p>

              <!-- Features List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Routes optimized in seconds, not hours</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">All your clients and pets in one place</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Less driving, less stress, more energy</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">14 days completely free to try it out</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/signup?email={{email}}" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Complete My Signup
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                If mobile grooming is working great for you without any route planning help, that's awesome! But if you ever feel like you're driving too much or running behind, we'll be here.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                All the best,
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Sequence 0.5: Trial Ending Reminder

### Email 1: Day 10 of Trial - Quick heads up

**Subject:** Quick heads up about your trial

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Quick heads up</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Just a quick heads up: your GroomRoute trial ends in a few days.
              </p>

              <!-- What Happens Next Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">Here's what happens next:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #525f7f; font-size: 15px;">• Your trial ends on <strong>{{trialEndDate}}</strong></span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #525f7f; font-size: 15px;">• You'll be charged <strong>{{planPrice}}/month</strong> for the {{planName}} plan</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #525f7f; font-size: 15px;">• Your card ending in <strong>{{cardLast4}}</strong> will be billed automatically</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 24px 0 12px;">
                Before you decide, try this one thing:
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                If you haven't yet, open your schedule and tap "Optimize Route" on a day with 2+ appointments. Watch it find the fastest order in seconds. That's the time savings you'll get every single day.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Optimize a Route
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 24px 0 12px;">
                Want to make changes?
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                No hard feelings if now isn't the right time. You can update your plan or cancel anytime from your account settings.
              </p>

              <!-- Secondary CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard/settings" style="background-color: #f8fafc; border-radius: 8px; color: #525f7f; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block; padding: 12px 24px; border: 1px solid #e6ebf1;">
                      Manage Subscription
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Questions? Just reply to this email.
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

              <p style="color: #6b7280; font-size: 14px; line-height: 22px; margin: 24px 0 0; font-style: italic;">
                <strong>P.S.</strong> If GroomRoute has been saving you time, you don't need to do anything — your subscription will start automatically.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Sequence 1: Onboarding - No Clients Added

### Email 1: Day 1 - Ready to add your first client?

**Subject:** Ready to add your first client?

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Ready to add your first client?</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Welcome to GroomRoute! You've taken the first step toward a more organized grooming business.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>The next step? Add your first client.</strong>
              </p>

              <!-- Steps Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 16px; line-height: 26px; margin: 0 0 8px 0;"><strong>It only takes 30 seconds:</strong></p>
                    <p style="color: #8B6239; font-size: 15px; line-height: 24px; margin: 0;">
                      1. Go to Clients → Add Client<br>
                      2. Enter their name, address, and pet info<br>
                      3. That's it!
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Once you have clients in the system, you can start scheduling appointments and optimizing your routes.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard/customers/new" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Add Your First Client
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <!-- Help Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #166534; font-size: 16px; margin: 0 0 8px 0;"><strong>Need to import existing clients?</strong></p>
                    <p style="color: #15803d; font-size: 14px; line-height: 22px; margin: 0;">
                      Reply to this email and we'll help you get set up.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0 4px;">
                Happy grooming!
              </p>
              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 2: Day 3 - Your client list is waiting

**Subject:** Your client list is waiting

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Your client list is waiting</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Just checking in! We noticed you haven't added any clients yet.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>Here's what you're missing out on:</strong>
              </p>

              <!-- Features List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">One-tap access to client addresses for navigation</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Complete pet profiles with grooming notes</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Appointment history at your fingertips</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Smart scheduling based on location</span>
                  </td>
                </tr>
              </table>

              <!-- Tips Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 15px; line-height: 24px; margin: 0;">
                      Most groomers start by adding just 5-10 of their regular clients. It takes about 10 minutes and makes a huge difference.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard/customers/new" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Add Clients Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Questions? Just reply to this email!
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Sequence 2: Onboarding - No Appointments Scheduled

### Email 1: Day 1 - Time to schedule your first appointment

**Subject:** Time to schedule your first appointment

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Time to schedule your first appointment</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Great job adding your first client! Now let's put them on the calendar.
              </p>

              <!-- Steps Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 16px; line-height: 26px; margin: 0 0 8px 0;"><strong>Scheduling is simple:</strong></p>
                    <p style="color: #8B6239; font-size: 15px; line-height: 24px; margin: 0;">
                      1. Go to Dashboard → Appointments<br>
                      2. Click "Add Appointment"<br>
                      3. Select your client and pick a time<br>
                      4. Done!
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Schedule Your First Appointment
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Once you have a few appointments scheduled, you can use route optimization to find the best order - saving you time and gas money.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0 4px;">
                Happy grooming!
              </p>
              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 2: Day 3 - Your route is ready to optimize

**Subject:** Your route is ready to optimize

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Your route is ready to optimize</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                You've got clients in the system - now let's put them to work!
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>Here's how most successful groomers use GroomRoute:</strong>
              </p>

              <!-- Morning Routine Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 16px; line-height: 26px; margin: 0 0 8px 0;"><strong>Morning Routine:</strong></p>
                    <p style="color: #8B6239; font-size: 15px; line-height: 24px; margin: 0;">
                      1. Open the app<br>
                      2. View today's appointments<br>
                      3. Tap "Optimize Route"<br>
                      4. Follow the suggested order
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                That's it. No more figuring out which client to visit first or backtracking across town.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                But first, you need appointments on the calendar.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Add Your First Appointment
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Already have appointments in another calendar? You can view them side-by-side and move them over as you go.
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Sequence 3: First Route Optimization Nudge

### Email 1: Ready to optimize your route?

**Subject:** Ready to optimize your route?

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Ready to optimize your route?</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Nice! You've got multiple appointments scheduled. <strong>This is where GroomRoute really shines.</strong>
              </p>

              <!-- Magic Moment Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 16px; line-height: 26px; margin: 0 0 8px 0;"><strong>Here's the magic moment:</strong></p>
                    <p style="color: #8B6239; font-size: 15px; line-height: 24px; margin: 0;">
                      1. Open your Dashboard<br>
                      2. Look at a day with 2+ appointments<br>
                      3. Tap "Optimize Route"<br>
                      4. Watch GroomRoute find the best order
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>It considers:</strong>
              </p>

              <!-- Features List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Driving distance between stops</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Time windows you've set</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Real-time traffic (when navigating)</span>
                  </td>
                </tr>
              </table>

              <!-- Highlight Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #166534; font-size: 16px; line-height: 24px; margin: 0;">
                      <strong>Most groomers save 30-60 minutes per day</strong> just by following the optimized order.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Try Route Optimization
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Let us know what you think!
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Sequence 4: PWA Installation Reminder

### Email 1: Add GroomRoute to your home screen

**Subject:** Quick tip: Add GroomRoute to your home screen

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Add GroomRoute to Your Home Screen</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                You've been using GroomRoute for a few days now - we hope it's making your grooming days smoother! Here's a quick tip to make things even easier:
              </p>

              <!-- Highlight Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 16px; line-height: 24px; margin: 0;">
                      Install GroomRoute as an app on your phone for instant access - no searching through bookmarks or typing URLs. <strong>It works just like a native app!</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>How to Install (30 seconds)</strong>
              </p>

              <!-- iPhone Instructions -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 16px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #1a1a1a; font-size: 15px; font-weight: bold; margin: 0 0 8px 0;">On iPhone (Safari):</p>
                    <p style="color: #525f7f; font-size: 14px; line-height: 22px; margin: 0;">
                      1. Open groomroute.com/dashboard in Safari<br>
                      2. Tap the Share button (square with arrow)<br>
                      3. Scroll down and tap "Add to Home Screen"
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Android Instructions -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 16px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #1a1a1a; font-size: 15px; font-weight: bold; margin: 0 0 8px 0;">On Android (Chrome):</p>
                    <p style="color: #525f7f; font-size: 14px; line-height: 22px; margin: 0;">
                      1. Open groomroute.com/dashboard in Chrome<br>
                      2. Tap the menu (three dots) at the top right<br>
                      3. Tap "Install app" or "Add to Home screen"
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Open GroomRoute Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Once installed, you'll have GroomRoute right on your home screen - perfect for checking your route each morning or updating appointments on the go.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Questions or need help? Just reply to this email!
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0 4px;">
                Happy grooming!
              </p>
              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Sequence 5: Re-engagement (Inactive Users)

### Email 1: Day 7 - We miss you

**Subject:** We miss you at GroomRoute

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">We miss you!</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                It's been a week since you've logged into GroomRoute. Everything okay?
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>We're here if you need help with:</strong>
              </p>

              <!-- Help Topics List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Setting up your client list</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Scheduling appointments</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Using route optimization</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Anything else!</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Log Back In
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Tip Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #166534; font-size: 15px; line-height: 24px; margin: 0;">
                      If you're swamped with grooming appointments (which is a good problem!), remember that GroomRoute works great on your phone. Quick check-ins between appointments are easy.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Just reply to this email if you have questions.
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Sequence 6: Winback (Canceled Customers)

### Email 1: 60 Days After Cancellation

**Subject:** A lot has changed at GroomRoute

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">A lot has changed</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                It's been a couple months since you left GroomRoute. We've been busy making things better:
              </p>

              <!-- What's New Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">What's New:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #525f7f; font-size: 15px;">Improved route optimization</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #525f7f; font-size: 15px;">Faster mobile experience</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #525f7f; font-size: 15px;">New scheduling features</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                We'd love to have you back. As a returning customer, here's a special offer:
              </p>

              <!-- Offer Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td align="center" style="padding: 24px;">
                    <p style="color: #8B6239; font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">
                      Get 50% off your first month back
                    </p>
                    <p style="color: #A5744A; font-size: 18px; margin: 0;">
                      Use code: <strong>WELCOMEBACK50</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/comeback" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Reactivate Your Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                No pressure - but if you're still doing mobile grooming, we think you'll love the improvements we've made.
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 2: 90 Days After Cancellation

**Subject:** One more thing...

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">One more thing...</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Last email, I promise!
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                If GroomRoute wasn't the right fit before, I understand. But I'm curious - <strong>what could we have done better?</strong>
              </p>

              <!-- Feedback Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #166534; font-size: 15px; line-height: 24px; margin: 0;">
                      Just hit reply and let me know. Your feedback helps us build a better product for mobile groomers everywhere.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                And if you ever want to give us another try, the door is always open.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Check Out GroomRoute
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Thanks for being part of our journey,
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Sequence 7: Payment Failed

### Email 1: Immediately - Action needed

**Subject:** Action needed: Payment failed

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Action needed: Payment failed</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                We tried to process your GroomRoute subscription payment, but it didn't go through.
              </p>

              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 12px; border: 1px solid #fee2e2; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #991b1b; font-size: 15px; font-weight: bold; margin: 0 0 8px 0;">This usually happens when:</p>
                    <p style="color: #b91c1c; font-size: 14px; line-height: 22px; margin: 0;">
                      • Card expired<br>
                      • Insufficient funds<br>
                      • Bank declined the transaction
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                To keep your account active, please update your payment method:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard/billing" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Update Payment Method
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 15px; line-height: 24px; margin: 0;">
                      Your account will remain active for 3 days while you sort this out. After that, you may lose access to your dashboard and client data.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Need help? Just reply to this email.
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 2: Day 2 - Expires tomorrow

**Subject:** Your GroomRoute access expires tomorrow

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Your access expires tomorrow</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Quick reminder: your payment still hasn't gone through, and your account access expires tomorrow.
              </p>

              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 12px; border: 1px solid #fee2e2; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #991b1b; font-size: 15px; font-weight: bold; margin: 0 0 8px 0;">Don't lose access to:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #b91c1c; font-size: 14px;">• Your client database</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #b91c1c; font-size: 14px;">• Upcoming appointments</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #b91c1c; font-size: 14px;">• Route optimization</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                It only takes 30 seconds to update your payment method:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard/billing" style="background-color: #dc2626; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Fix Payment Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                If you're having trouble, reply to this email and we'll help.
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Sequence 8: NPS/Feedback Request

### Email 1: 30 Days After First Payment

**Subject:** Quick question (30 seconds)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Quick question</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                You've been using GroomRoute for a month now. We'd love to know how it's going!
              </p>

              <p style="color: #1a1a1a; font-size: 16px; line-height: 26px; margin: 24px 0; text-align: center; font-weight: bold;">
                How likely are you to recommend GroomRoute to a fellow mobile groomer?
              </p>

              <!-- NPS Scale -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="4">
                      <tr>
                        <td align="center" style="padding: 4px;">
                          <a href="https://groomroute.com/nps?score=1&email={{email}}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #fee2e2; color: #991b1b; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">1</a>
                        </td>
                        <td align="center" style="padding: 4px;">
                          <a href="https://groomroute.com/nps?score=2&email={{email}}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #fee2e2; color: #991b1b; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">2</a>
                        </td>
                        <td align="center" style="padding: 4px;">
                          <a href="https://groomroute.com/nps?score=3&email={{email}}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #fef3c7; color: #92400e; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">3</a>
                        </td>
                        <td align="center" style="padding: 4px;">
                          <a href="https://groomroute.com/nps?score=4&email={{email}}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #fef3c7; color: #92400e; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">4</a>
                        </td>
                        <td align="center" style="padding: 4px;">
                          <a href="https://groomroute.com/nps?score=5&email={{email}}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #fef3c7; color: #92400e; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">5</a>
                        </td>
                        <td align="center" style="padding: 4px;">
                          <a href="https://groomroute.com/nps?score=6&email={{email}}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #fef3c7; color: #92400e; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">6</a>
                        </td>
                        <td align="center" style="padding: 4px;">
                          <a href="https://groomroute.com/nps?score=7&email={{email}}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #d1fae5; color: #065f46; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">7</a>
                        </td>
                        <td align="center" style="padding: 4px;">
                          <a href="https://groomroute.com/nps?score=8&email={{email}}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #d1fae5; color: #065f46; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">8</a>
                        </td>
                        <td align="center" style="padding: 4px;">
                          <a href="https://groomroute.com/nps?score=9&email={{email}}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">9</a>
                        </td>
                        <td align="center" style="padding: 4px;">
                          <a href="https://groomroute.com/nps?score=10&email={{email}}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">10</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left" style="color: #6b7280; font-size: 12px;">Not likely</td>
                        <td align="right" style="color: #6b7280; font-size: 12px;">Very likely</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 24px 0; text-align: center;">
                Just click a number above - that's it!<br>
                <span style="font-size: 14px; color: #6b7280;">(Optional: add a comment on the next page)</span>
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Your feedback helps us build a better product.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Thanks!
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Sequence 9: Paying Member Nurture

**Note:** Emails 5 and 8 are founder/personal emails and should be plain text for authenticity.

### Email 1: Day 0 - Welcome to the GroomRoute family

**Subject:** Welcome to the GroomRoute family!

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Welcome to the family!</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>Congratulations!</strong> You're officially a GroomRoute member.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Thank you for trusting us with your mobile grooming business. We're honored to be part of your daily routine.
              </p>

              <!-- What to expect box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">Here's what you can expect from us:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #8B6239; font-size: 15px;">Regular tips to help you get the most out of GroomRoute</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #8B6239; font-size: 15px;">Business insights from other successful mobile groomers</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #8B6239; font-size: 15px;">First access to new features</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #8B6239; font-size: 15px;">Priority support whenever you need it</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Stats highlight -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px; text-align: center;">
                    <p style="color: #166534; font-size: 16px; line-height: 24px; margin: 0;">
                      You're joining a community of mobile groomers who collectively save over <strong>500 hours per week</strong> on route planning.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                If you ever need anything, just reply to this email. We read and respond to every message.
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Here's to calmer grooming days ahead!
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 2: Day 3 - Power User Tips

**Subject:** 3 features you might have missed

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">3 features you might have missed</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Now that you're all set up, here are 3 power-user features that can save you even more time:
              </p>

              <!-- Feature 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #1a1a1a; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">1. Quick Reschedule</p>
                    <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
                      Drag and drop appointments on your calendar to reschedule instantly. No need to delete and recreate.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #1a1a1a; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">2. Pet Notes</p>
                    <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
                      Add grooming notes to each pet's profile (temperament, preferred cuts, special instructions). They'll show up automatically on appointment day.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #1a1a1a; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">3. Navigation Integration</p>
                    <p style="color: #525f7f; font-size: 15px; line-height: 24px; margin: 0;">
                      After optimizing your route, tap any address to open it directly in your preferred maps app. One-tap navigation to every stop.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Open GroomRoute
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0; text-align: center;">
                Which feature will you try first?
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 3: Day 7 - Micro-feedback

**Subject:** Quick question (one-liner reply)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Quick question</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                You've been using GroomRoute for a week now. One quick question:
              </p>

              <!-- Question Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: #8B6239; font-size: 18px; font-weight: bold; margin: 0;">
                      What's one thing you wish was easier?
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Just hit reply with whatever comes to mind — even a one-liner helps. I read every response.
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 4: Day 10 - Scheduling Strategies

**Subject:** How top groomers plan their week

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">How top groomers plan their week</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                After talking with hundreds of mobile groomers, we've noticed a pattern among the most successful ones:
              </p>

              <!-- Key Insight Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px; text-align: center;">
                    <p style="color: #8B6239; font-size: 18px; font-weight: bold; margin: 0;">
                      They plan their week on Sunday night.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Here's the simple routine that works:
              </p>

              <!-- Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; background-color: #A5744A; color: #ffffff; text-align: center; border-radius: 50%; font-size: 12px; font-weight: bold; margin-right: 12px;">1</span>
                    <span style="color: #525f7f; font-size: 15px;">Sunday evening: Open GroomRoute and review the upcoming week</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; background-color: #A5744A; color: #ffffff; text-align: center; border-radius: 50%; font-size: 12px; font-weight: bold; margin-right: 12px;">2</span>
                    <span style="color: #525f7f; font-size: 15px;">Look for scheduling gaps you can fill with recurring clients</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; background-color: #A5744A; color: #ffffff; text-align: center; border-radius: 50%; font-size: 12px; font-weight: bold; margin-right: 12px;">3</span>
                    <span style="color: #525f7f; font-size: 15px;">Check for back-to-back appointments that might need buffer time</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; background-color: #A5744A; color: #ffffff; text-align: center; border-radius: 50%; font-size: 12px; font-weight: bold; margin-right: 12px;">4</span>
                    <span style="color: #525f7f; font-size: 15px;">Optimize each day's route so you're ready to go</span>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                This 15-minute habit can save hours of stress during the week.
              </p>

              <!-- Pro Tip Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #166534; font-size: 15px; line-height: 24px; margin: 0;">
                      <strong>Pro tip:</strong> Block out lunch breaks and personal time as "appointments" so you don't accidentally overbook yourself.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Plan Your Week
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                How do you plan your schedule? Reply and let us know - we love learning from our groomers.
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 5: Day 14 - Route Optimization Deep Dive

**Subject:** Getting the most out of route optimization

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Route Optimization Deep Dive</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Route optimization is the heart of GroomRoute. Here's how to squeeze every minute of saved time out of it:
              </p>

              <!-- Basics Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">The Basics:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">•</span>
                          <span style="color: #525f7f; font-size: 15px;">Works best with 3+ appointments per day</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">•</span>
                          <span style="color: #525f7f; font-size: 15px;">Considers drive time between each stop</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">•</span>
                          <span style="color: #525f7f; font-size: 15px;">Updates in real-time when you add or remove appointments</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #1a1a1a; font-size: 18px; font-weight: bold; margin: 24px 0 16px;">
                Advanced Tips:
              </p>

              <!-- Tip 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 16px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #8B6239; font-size: 15px; font-weight: bold; margin: 0 0 4px 0;">Set realistic appointment durations</p>
                    <p style="color: #8B6239; font-size: 14px; line-height: 22px; margin: 0;">
                      If you typically spend 90 minutes on a full groom, don't schedule 60. Accurate durations = accurate route times.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Tip 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 16px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #8B6239; font-size: 15px; font-weight: bold; margin: 0 0 4px 0;">Use time windows wisely</p>
                    <p style="color: #8B6239; font-size: 14px; line-height: 22px; margin: 0;">
                      If a client says "anytime after 10am," set that as their earliest time. GroomRoute will respect it while optimizing around it.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Tip 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 16px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #8B6239; font-size: 15px; font-weight: bold; margin: 0 0 4px 0;">Re-optimize after changes</p>
                    <p style="color: #8B6239; font-size: 14px; line-height: 22px; margin: 0;">
                      Added a last-minute appointment? Tap optimize again. The best route may have changed.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Tip 4 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 16px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #166534; font-size: 15px; font-weight: bold; margin: 0 0 4px 0;">Check time saved</p>
                    <p style="color: #166534; font-size: 14px; line-height: 22px; margin: 0;">
                      After optimizing, compare the original vs. optimized drive time. That difference? That's free time back in your day.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Try It Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Questions about optimization? Just reply - we're happy to help.
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 7: Day 30 - Referral Ask

**Subject:** Know another groomer who'd love this?

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Know another groomer who'd love this?</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                You've been with us for a month now, and we hope GroomRoute is making your days calmer and more organized.
              </p>

              <!-- Highlight Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 15px; line-height: 24px; margin: 0;">
                      Here's something you might not know: <strong>Most of our groomers found us through a recommendation from another groomer.</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                If GroomRoute has helped you, would you consider sharing it with a fellow mobile groomer?
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 24px 0 12px;">
                Why refer a friend:
              </p>

              <!-- Benefits -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
                <tr>
                  <td style="padding: 6px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">They get a 14-day free trial to try it out</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">You'll be helping them discover the same time savings you're enjoying</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;">
                    <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                    <span style="color: #525f7f; font-size: 15px;">Good karma for helping a fellow groomer!</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com?ref={{accountId}}" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Share GroomRoute
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                No pressure at all. We just know that mobile groomers trust recommendations from other groomers more than anything we could say.
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Thanks for being part of our community!
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 8: Day 45 - Busy Season Planning

**Subject:** Preparing for your busy season

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Preparing for your busy season</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Whether it's holiday season, summer, or spring shedding - every groomer has their busy periods. Here's how to handle the rush without burning out:
              </p>

              <!-- Tip 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 16px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 0 0 4px 0;">1. Set Maximum Daily Appointments</p>
                    <p style="color: #525f7f; font-size: 14px; line-height: 22px; margin: 0;">
                      Know your limit. If 6 appointments is your max, don't book 8 just because clients are asking.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Tip 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 16px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 0 0 4px 0;">2. Build in Buffer Days</p>
                    <p style="color: #525f7f; font-size: 14px; line-height: 22px; margin: 0;">
                      Leave one day per week lighter than usual for overflow, emergencies, or catch-up.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Tip 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 16px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 0 0 4px 0;">3. Prioritize by Location</p>
                    <p style="color: #525f7f; font-size: 14px; line-height: 22px; margin: 0;">
                      During busy times, it's okay to be picky about new clients. Prioritize ones that fit your existing routes.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Tip 4 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 16px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 0 0 4px 0;">4. Use Wait Lists</p>
                    <p style="color: #525f7f; font-size: 14px; line-height: 22px; margin: 0;">
                      Fully booked? Add clients to a wait list for cancellations. GroomRoute makes it easy to slot them in.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Tip 5 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 16px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 0 0 4px 0;">5. Batch Similar Appointments</p>
                    <p style="color: #525f7f; font-size: 14px; line-height: 22px; margin: 0;">
                      If you have several small dogs, group them together. You'll get into a rhythm and work more efficiently.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Key Insight Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px; text-align: center;">
                    <p style="color: #166534; font-size: 16px; line-height: 24px; margin: 0;">
                      The goal isn't to do <em>more</em> appointments - it's to do the <em>right</em> appointments without exhausting yourself.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/dashboard" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Open Your Schedule
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                How do you handle busy season? We'd love to hear your tips.
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 10: Day 90 - 3 Month Milestone

**Subject:** 3 months together!

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">3 months together!</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                You've been a GroomRoute member for 3 months!
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                We don't take that for granted. In a world of endless apps and subscriptions, you've chosen to make GroomRoute part of your daily routine. That means a lot to us.
              </p>

              <!-- By Now Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #166534; font-size: 16px; font-weight: bold; margin: 0 0 12px 0;">By now, you've probably:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #166534; font-size: 15px;">Saved hours of route planning</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #166534; font-size: 15px;">Never forgotten a client's pet notes</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
                          <span style="color: #166534; font-size: 15px;">Arrived at appointments calmer and more prepared</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 24px 0 12px;">
                What's next:
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                We're always working on making GroomRoute better. Keep an eye on your inbox for updates, and remember - your feedback shapes our roadmap.
              </p>

              <!-- Review Ask Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 15px; font-weight: bold; margin: 0 0 8px 0;">One small ask:</p>
                    <p style="color: #8B6239; font-size: 15px; line-height: 24px; margin: 0;">
                      If you have a minute, a quick review on the App Store or Google Play helps other groomers find us.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="https://groomroute.com/review" style="background-color: #A5744A; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 14px 32px;">
                      Leave a Review
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Here's to the next 3 months!
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                With gratitude,
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 11: Day 120 - Feature Request

**Subject:** What would make GroomRoute better for you?

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">What would make GroomRoute better?</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Quick question: If you could add one feature to GroomRoute, what would it be?
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                We're always planning our next improvements, and your input matters more than you might think. Some ideas:
              </p>

              <!-- Ideas List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="color: #A5744A; font-weight: bold; margin-right: 8px;">•</span>
                          <span style="color: #525f7f; font-size: 15px;">Client reminders/notifications?</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="color: #A5744A; font-weight: bold; margin-right: 8px;">•</span>
                          <span style="color: #525f7f; font-size: 15px;">Payment tracking?</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="color: #A5744A; font-weight: bold; margin-right: 8px;">•</span>
                          <span style="color: #525f7f; font-size: 15px;">Team scheduling for multiple groomers?</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="color: #A5744A; font-weight: bold; margin-right: 8px;">•</span>
                          <span style="color: #525f7f; font-size: 15px;">Something else entirely?</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Highlight Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px; text-align: center;">
                    <p style="color: #8B6239; font-size: 16px; line-height: 24px; margin: 0;">
                      Just reply with your <strong>#1 wishlist item</strong>.<br>
                      Even a quick one-liner helps.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Thanks for helping us build the best tool for mobile groomers.
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 12: Day 180 - 6 Month Anniversary

**Subject:** Half a year with GroomRoute

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Half a year with GroomRoute</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>6 months!</strong> You're officially a GroomRoute veteran.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Thank you for sticking with us. Building a business is hard, and we're proud to be a small part of your journey.
              </p>

              <!-- Request Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #8B6239; font-size: 15px; font-weight: bold; margin: 0 0 8px 0;">A request:</p>
                    <p style="color: #8B6239; font-size: 15px; line-height: 24px; margin: 0;">
                      If GroomRoute has made a difference in your work, would you consider recommending us to one other mobile groomer? Your word-of-mouth is how we grow.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Promise Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #166534; font-size: 15px; font-weight: bold; margin: 0 0 8px 0;">A promise:</p>
                    <p style="color: #166534; font-size: 15px; line-height: 24px; margin: 0;">
                      We'll keep working to make GroomRoute better, simpler, and more helpful. If you ever need anything, we're just an email away.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Here's to the next 6 months!
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### Email 13: Day 365 - 1 Year Anniversary

**Subject:** Happy Anniversary!

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">

          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 20px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="https://groomroute.com/images/app-icon-192.png" width="32" height="32" alt="GroomRoute" style="border-radius: 6px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #1a1a1a; font-size: 28px; font-weight: bold;">Groom<span style="color: #A5744A;">Route</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 48px;">

              <h1 style="color: #1a1a1a; font-size: 28px; font-weight: bold; text-align: center; margin: 32px 0 24px;">Happy Anniversary!</h1>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Hi {{firstName}},
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                One year ago, you joined GroomRoute.
              </p>

              <!-- Celebration Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f0; border-radius: 12px; border: 1px solid #f5e6d8; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: #8B6239; font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">
                      365 days
                    </p>
                    <p style="color: #8B6239; font-size: 15px; line-height: 24px; margin: 0;">
                      of organized schedules, optimized routes, and (hopefully) calmer grooming days.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                <strong>Thank you for being with us for this entire journey.</strong> Seriously - it means the world.
              </p>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                We've grown a lot this year, and so much of that is because groomers like you believed in what we're building. Your feedback, your patience, and your word-of-mouth have shaped GroomRoute into what it is today.
              </p>

              <!-- Year Two Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px 24px; text-align: center;">
                    <p style="color: #166534; font-size: 18px; font-weight: bold; margin: 0;">
                      Here's to year two!
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                If there's anything we can do to make your next year even better, just reply and let us know.
              </p>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

              <p style="color: #525f7f; font-size: 16px; line-height: 26px; margin: 16px 0;">
                With deep appreciation,
              </p>

              <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 24px;">
                The GroomRoute Team
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 48px;">
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                GroomRoute - The scheduling system built only for mobile groomers
              </p>
              <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 8px 0;">
                <a href="https://groomroute.com/privacy" style="color: #8898aa; text-decoration: underline;">Privacy Policy</a>
                |
                <a href="https://groomroute.com/terms" style="color: #8898aa; text-decoration: underline;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Design Reference

### Colors

| Element | Hex Code |
|---------|----------|
| Brand accent | `#A5744A` |
| Background | `#f6f9fc` |
| Container | `#ffffff` |
| Heading text | `#1a1a1a` |
| Body text | `#525f7f` |
| Muted text | `#6b7280` |
| Footer text | `#8898aa` |
| Checkmark | `#10b981` |
| Amber box bg | `#fef7f0` |
| Amber box border | `#f5e6d8` |
| Amber box text | `#8B6239` |
| Green box bg | `#f0fdf4` |
| Green box border | `#dcfce7` |
| Green box text | `#166534` |
| Red box bg | `#fef2f2` |
| Red box border | `#fee2e2` |
| Red box text | `#991b1b` |

### Button Styles

**Primary Button:**
```css
background-color: #A5744A;
border-radius: 8px;
color: #ffffff;
font-size: 16px;
font-weight: bold;
padding: 14px 32px;
```

**Urgent Button:**
```css
background-color: #dc2626;
/* Same other styles */
```

### Loops Variables

Use these Loops merge tags in templates:
- `{{firstName}}` - User's first name
- `{{email}}` - User's email address
- `{{businessName}}` - Business name (if available)

---

## Notes for Loops Setup

1. **Copy the full HTML** for each email template into Loops' code editor
2. **Test in Loops** preview to verify rendering
3. **Replace placeholder URLs** if needed (all currently point to groomroute.com)
4. **Update the "What's New" section** in the winback email with actual recent features
5. **NPS links** include `{{email}}` - verify this works in Loops or adjust the merge tag syntax
