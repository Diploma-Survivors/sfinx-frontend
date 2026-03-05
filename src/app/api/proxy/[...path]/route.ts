import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleProxy(request, resolvedParams.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const requestPath = resolvedParams.path.join('/');
  if (requestPath === 'signin') {
    try {
      const csrfData = await getCSRFToken(request);
      const formData = await request.formData();
      const accessToken = formData.get('accessToken')?.toString() || '';
      const refreshToken = formData.get('refreshToken')?.toString() || '';
      const redirectPath = formData.get('redirect')?.toString() || '/problems';
      const deviceId = formData.get('deviceId')?.toString() || '';

      const htmlContent = generateAuthForm(
        accessToken,
        refreshToken,
        redirectPath,
        deviceId,
        csrfData.token,
        request
      );

      // Create response headers
      const responseHeaders = new Headers({
        'Content-Type': 'text/html',
      });

      // Directly forward all Set-Cookie headers from CSRF response without parsing
      if (csrfData.cookies && csrfData.cookies.length > 0) {
        for (const cookieHeader of csrfData.cookies) {
          responseHeaders.append('Set-Cookie', cookieHeader);
        }
      } else {
        // Fallback: manually set the CSRF token cookie if no cookies were returned
        const fallbackCsrfCookie = `next-auth.csrf-token=${csrfData.token}; Path=/; HttpOnly; SameSite=lax`;
        responseHeaders.append('Set-Cookie', fallbackCsrfCookie);
      }

      const response = new NextResponse(htmlContent, {
        status: 200,
        headers: responseHeaders,
      });

      return response;
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }
  }

  return handleProxy(request, resolvedParams.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleProxy(request, resolvedParams.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleProxy(request, resolvedParams.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleProxy(request, resolvedParams.path, 'PATCH');
}

async function handleProxy(
  request: NextRequest,
  proxyPath: string[],
  method: string
) {
  // add logic here;
}

// Update the getCSRFToken function to return both token and cookies
async function getCSRFToken(
  request: NextRequest
): Promise<{ token: string; cookies?: string[] }> {
  try {
    // Get the current domain and protocol
    const protocol =
      request.headers.get('x-forwarded-proto') ||
      (request.url.startsWith('https') ? 'https' : 'http');
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Make request to NextAuth's CSRF endpoint
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`, {
      method: 'GET',
      headers: {
        // remove cookies to work properly
        // 'Cookie': request.headers.get('cookie') || '',
        'User-Agent': request.headers.get('user-agent') || 'NextJS-Proxy',
      },
    });

    if (csrfResponse.ok) {
      const csrfData = await csrfResponse.json();

      // Get all Set-Cookie headers from the response
      const setCookieHeaders = csrfResponse.headers.getSetCookie?.() || [];

      return {
        token: csrfData.csrfToken,
        cookies: setCookieHeaders.length > 0 ? setCookieHeaders : undefined,
      };
    }
    throw new Error(`CSRF request failed with status: ${csrfResponse.status}`);
  } catch (error) {
    // Return a fallback token if NextAuth fails
    return {
      token: 'fallback-',
    };
  }
}

function generateAuthForm(
  accessToken: string,
  refreshToken: string,
  redirectPath: string,
  deviceId: string,
  csrfToken: string,
  request: NextRequest
): string {
  // Determine the target URL for form submission
  const protocol =
    request.headers.get('x-forwarded-proto') ||
    (request.url.startsWith('https') ? 'https' : 'http');
  const host = request.headers.get('host');
  const targetUrl = `${protocol}://${host}/api/auth/callback/sso`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redirecting...</title>
        <style>
            /* SfinX Color System Extracted from globals.css */
            :root {
                --background: oklch(1 0 0);
                --foreground: oklch(0.145 0 0);
                --primary: oklch(0.54 0.17 142);
                --primary-foreground: oklch(1 0 0);
                --muted-foreground: oklch(0.556 0 0);
            }

            @media (prefers-color-scheme: dark) {
                :root {
                    --background: oklch(0.145 0 0);
                    --foreground: oklch(0.985 0 0);
                    --primary: oklch(0.623 0.188 145.42);
                    --primary-foreground: oklch(0.145 0 0);
                    --muted-foreground: oklch(0.708 0 0);
                }
            }

            body {
                font-family: 'Geist Sans', Arial, sans-serif;
                margin: 0;
                background-color: var(--background);
                color: var(--foreground);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            /* Overlay mimicking bg-background/50 and backdrop-blur-sm */
            .loader-container {
                position: fixed;
                inset: 0;
                z-index: 100;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: color-mix(in srgb, var(--background) 50%, transparent);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
            }

            .loader-wrapper {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                gap: 2.5rem;
                padding: 24px;
                max-width: 90%;
                width: 450px;
            }

            /* Wrapper that mimics animate-pulse */
            .brand-animation {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }

            /* SfinX typography mimicking text-6xl font-bold tracking-tight text-primary */
            .brand-text {
                font-size: 3.75rem; 
                line-height: 1;
                font-weight: 700; 
                letter-spacing: -0.025em; 
                color: var(--primary); 
            }

            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: .5;
                }
            }

            /* Information Text Styles */
            .text-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.75rem;
            }

            h2 {
                font-size: 1.25rem;
                font-weight: 600;
                margin: 0;
                color: var(--foreground);
                letter-spacing: -0.025em;
            }

            p {
                font-size: 0.95rem;
                margin: 0;
                color: var(--muted-foreground);
            }

            small {
                font-size: 0.85rem;
                color: var(--muted-foreground);
                opacity: 0.8;
                margin-top: 0.25rem;
            }

            /* Submit Button using actual SfinX Primary Colors */
            .btn {
                margin-top: 1.5rem;
                padding: 0.625rem 1.25rem;
                background-color: var(--primary);
                color: var(--primary-foreground);
                border: none;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                transition: opacity 0.2s ease;
            }

            .btn:hover {
                opacity: 0.9;
            }

            #postRedirectForm {
                margin: 0;
                display: flex;
                justify-content: center;
            }
        </style>
    </head>
    <body>
        <div class="loader-container">
            <div class="loader-wrapper">
                <!-- Pulsing Global Loader mimicking your frontend -->
                <div class="brand-animation">
                    <span class="brand-text">SfinX</span>
                </div>
                
                <!-- Information text and manual form sumbit -->
                <div class="text-info">
                    <h2>Redirecting...</h2>
                    <p>Please wait while we process your authentication...</p>
                    <p><small>If you are not redirected automatically, please click the button below.</small></p>

                    <form id="postRedirectForm" action="${targetUrl}" method="POST">
                        <input type="hidden" name="accessToken" value="${accessToken}" />
                        <input type="hidden" name="refreshToken" value="${refreshToken}" />
                        <input type="hidden" name="deviceId" value="${deviceId}" />
                        <input type="hidden" name="csrfToken" value="${csrfToken}" />
                        <input type="hidden" name="callbackUrl" value="${redirectPath}" />
                        <button type="submit" class="btn">
                            Continue
                        </button>
                    </form>
                </div>
            </div>
        </div>
        
        <script type="text/javascript">
            // Automatically submit the form after a short delay
            setTimeout(() => {
                document.getElementById('postRedirectForm').submit();
            }, 1000);
            
            // Fallback: submit when the page has fully loaded
            window.addEventListener('load', () => {
                setTimeout(() => {
                    if (!document.hidden) {
                        document.getElementById('postRedirectForm').submit();
                    }
                }, 2000);
            });
        </script>
    </body>
    </html>
  `;
}
