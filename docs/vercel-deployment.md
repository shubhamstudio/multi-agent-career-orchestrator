# Vercel deployment guide

Deploy the frontend and each backend service as separate Vercel projects connected to this repository. For every backend project, set the Root Directory shown below and enable **Include source files outside of the Root Directory**; each service imports `backend/shared`.

## Deployable services

| Project | Root directory | Function duration | Required environment variables |
| --- | --- | --- | --- |
| Gateway | `backend/gateway` | 300 seconds | `REDIS_URL`, `INTERNAL_SERVICE_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `AUTH_SERVICE_URL`, `RESUME_SERVICE_URL`, `INTERVIEW_SERVICE_URL`, `ROADMAP_SERVICE_URL`, `BILLING_SERVICE_URL`, `FRONTEND_URL` |
| Auth | `backend/services/auth` | 60 seconds | `MONGODB_URL`, `REDIS_URL`, `INTERNAL_SERVICE_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_B64` |
| Resume | `backend/services/resume` | 300 seconds | `MONGODB_URL`, `REDIS_URL`, `GROQ_API_KEY`, `INTERNAL_SERVICE_API_KEY`, `BLOB_READ_WRITE_TOKEN` |
| Interview | `backend/services/interview` | 300 seconds | `MONGODB_URL`, `REDIS_URL`, `GROQ_API_KEY`, `DEEPGRAM_API_KEY`, `INTERNAL_SERVICE_API_KEY`, `BLOB_READ_WRITE_TOKEN` |
| Roadmap | `backend/services/roadmap` | 300 seconds | `MONGODB_URL`, `REDIS_URL`, `GROQ_API_KEY`, `INTERNAL_SERVICE_API_KEY` |
| Billing | `backend/services/billing` | 10 seconds | `MONGODB_URL`, `AUTH_MONGODB_DATABASE`, `REDIS_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `INTERNAL_SERVICE_API_KEY` |

Use one high-entropy `INTERNAL_SERVICE_API_KEY` in all backend projects. Never expose it to the frontend or prefix it with `VITE_`. Each downstream service verifies this header, so its public URL cannot be used directly without the shared key.

## Persistent files: private Vercel Blob

Create one **private** Blob store in Vercel Storage and connect it to the Gateway, Resume, and Interview projects. Vercel adds `BLOB_READ_WRITE_TOKEN` when a store is connected; if the same store is not connected to all three projects, add its token manually as an encrypted environment variable in each of them.

The frontend first obtains a one-time upload authorization from the authenticated Gateway. The browser then sends the file straight to Blob, avoiding Vercel Functions' 4.5 MB body limit. The client never receives `BLOB_READ_WRITE_TOKEN`.

The Resume service stores each processed PDF's private Blob URL, metadata, extracted text, and AI analysis in `Resume.sourceFiles`, with `sourceFile` indicating the latest one. The Interview service stores each processed audio chunk's URL, metadata, and transcript inside the current question's `audioRecords`. Nothing deletes these Blob objects after processing.

Private Blob URLs cannot be downloaded anonymously. Add authenticated download endpoints before displaying the original files in the product; Vercel recommends retrieving private blobs server-side after checking the current user.

## Firebase Admin credential

The Auth service no longer reads a service-account JSON file. On your own machine, encode the existing file and copy the resulting single-line value into Vercel's encrypted `FIREBASE_SERVICE_ACCOUNT_B64` variable. Do not commit the value.

PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("backend/services/auth/serviceAccountKey.json")) | Set-Clipboard
```

## URLs and deployment order

Deploy Auth, Resume, Interview, Roadmap, and Billing first. Copy each production URL into the matching Gateway `*_SERVICE_URL` variable, then deploy Gateway. Finally deploy the frontend rooted at `frontend` and set:

```text
VITE_BACKEND_URL=https://your-gateway.vercel.app
```

Set Gateway `FRONTEND_URL` to the exact frontend production URL. The browser session cookie is cross-site, so production needs HTTPS and the exact credentialed CORS origin.

Gateway and Roadmap both use Fluid Compute's 300-second maximum. Their present paths make bounded, synchronous LLM calls; no path is expected to approach 300 seconds under normal provider response times. Resume and Interview processing also use 300 seconds because fetching the private record plus calling Groq or Deepgram may exceed a short function default.

## Deploy check

- Verify all Vercel project Node runtimes are 20.x or newer.
- Confirm MongoDB and Redis are externally hosted; Vercel Functions do not replace either persistent service.
- Test login, then a PDF above 4.5 MB and an audio chunk above 4.5 MB.
- Confirm the Resume/Interview Mongo documents contain the private Blob URL and the processed output together.
- Test a cold Gateway call that chains to Resume, Interview, and Roadmap, and review function logs for timeouts.
- Keep `maxDuration: 300` for Gateway and Roadmap; only consider asynchronous jobs if real production traces approach that limit.
