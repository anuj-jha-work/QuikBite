# QuikBite Test Report

## Automated checks completed

| Check | Result |
| --- | --- |
| Go formatting | Passed |
| `go test ./...` | Passed |
| `go vet ./...` | Passed |
| `go build ./cmd/api` | Passed |
| Customer `npm run build` | Passed |
| Admin `npm run build` | Passed |
| Configuration validation tests | Passed |
| Health endpoint test | Passed |
| Unknown-route test | Passed |
| Protected-route-without-token test | Passed |
| Address validation and currency rounding tests | Passed |

## Checks requiring live services

These require valid credentials and deployed services:

- MongoDB Atlas login and order flow
- Customer browser smoke test
- Admin browser smoke test
- Cloudinary image upload
- Final production CORS verification

## Manual smoke-test checklist

1. Open `/healthz` and confirm the API returns `status: ok`.
2. Register a customer and log in.
3. Load the food list.
4. Add food to the cart and update quantity.
5. Place an order and verify order history.
6. Log in to the admin application.
7. Add food with an image.
8. Change an order status.

Do not use destructive database commands during verification.
