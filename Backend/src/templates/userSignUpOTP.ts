export const userSignUpOTPTemplate = (otpCode: string) => {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email - Libro</title>
  
  <!-- Import Google Fonts for clients that support it (Apple Mail, iOS, some webmail) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@700;900&display=swap" rel="stylesheet">

  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  
  <style>
    /* Reset & Base Setup */
    body {
      margin: 0;
      padding: 0;
      background-color: #e2e8f5;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
      -ms-interpolation-mode: bicubic;
    }
    
    /* Responsive overrides */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        margin: auto !important;
      }
      .content-padding {
        padding: 30px 20px !important;
      }
      .otp-box {
        font-size: 24px !important;
        letter-spacing: 6px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #e2e8f5;">

  <!-- Background Table (Added extra top/bottom padding here) -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #e2e8f5; padding: 60px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Email Container -->
        <table class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; width: 600px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Area -->
          <tr>
            <td align="center" style="padding: 50px 40px 20px 40px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- LOGO PLACEHOLDER: Replace src with your actual logo URL -->
                  <td align="center" style="padding-right: 12px;">
                    <img src="https://via.placeholder.com/40x40/1d4ed8/ffffff?text=L" alt="Libro Logo" width="40" height="40" style="display: block; width: 40px; height: 40px; border-radius: 4px;" />
                  </td>
                  <!-- BRAND NAME TEXT -->
                  <td align="center" style="font-size: 32px; font-weight: 900; color: #1e293b; font-family: 'Merriweather', Georgia, serif; letter-spacing: 0.5px;">
                    Libro
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                <tr>
                  <td style="border-bottom: 1px solid #e2e8f0;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td class="content-padding" style="padding: 10px 50px 40px 50px; color: #334155; font-size: 16px; line-height: 1.6; font-weight: 400;">
              <p style="margin: 0 0 20px 0;">Dear Student,</p>
              
              <p style="margin: 0 0 20px 0;">Thank you for signing up with Libro. To complete your registration request, we need to verify your email address.</p>
              
              <p style="margin: 0 0 30px 0;">Please use the following One-Time Password (OTP) to verify your email:</p>
              
              <!-- OTP Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div class="otp-box" style="background-color: #fce7f3; color: #0f172a; font-size: 32px; font-weight: 700; letter-spacing: 12px; padding: 15px 30px; display: inline-block; text-align: center; border-radius: 2px;">
                      ${otpCode}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 20px 0; color: #dc2626; text-align: left; font-weight: 400;">
                This code will expire in 10 minutes for security purposes.
              </p>

              <p style="margin: 0 0 25px 0;">
                Verifying your email ensures secure access to your personalized library account, where you can borrow books, track your activity, and more.
              </p>

              <p style="margin: 0 0 40px 0; font-size: 13px; color: #64748b; font-style: italic;">
                *If you didn't initiate this request, please ignore this message.
              </p>

              <p style="margin: 0 0 5px 0;">Warm regards,</p>
              <p style="margin: 0; font-weight: 600; color: #0f172a;">Libro Team</p>
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td align="center" style="background-color: #1e293b; color: #f8fafc; padding: 35px 20px; font-size: 12px; line-height: 1.8;">
              <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; font-family: 'Merriweather', Georgia, serif; letter-spacing: 0.5px;">
                Library Management System
              </p>
              <p style="margin: 0 0 5px 0; color: #cbd5e1;">
                Email: support@libro.com | Phone: +880 1989688144
              </p>
              <p style="margin: 0 0 15px 0; color: #cbd5e1;">
                Explore more at: <a href="https://xyz.com" style="color: #93c5fd; text-decoration: none;">xyz.com</a>
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                © ${currentYear} Libro. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
