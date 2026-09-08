# Deploy TopBoy Editions on InfinityFree

## 1. Create the free site

1. Create an account at https://dash.infinityfree.com/.
2. Create or select the hosting account for `topboystudios.lovestoblog.com`.
3. Open the hosting account dashboard and note the FTP hostname, username, password, and document-root folder.

## 2. Upload the site

Upload these items into the account's `htdocs` folder:

- `index.html`
- `order.php`
- the complete `images` folder

Do not upload the whole `artstudio` folder inside `htdocs`, or the homepage will be one directory too deep.

You can use InfinityFree's Online File Manager or an FTP client such as FileZilla. Keep the `images` folder beside `index.html` and `order.php`.

## 3. Configure order email

The order endpoint currently sends orders to `brooklynwangson@gmail.com` and uses `no-reply@topboystudios.lovestoblog.com` as the sender. It also supports an `ORDER_EMAIL` environment override.

Free hosting mail delivery can be restricted or unreliable. Test the form after uploading. If the email does not arrive, configure SMTP through a provider such as Brevo and replace the PHP `mail()` call with PHPMailer. Never put SMTP passwords in `index.html` or commit them to Git.

## 4. Test the live site

Open `https://topboystudios.lovestoblog.com`. Add a poster, choose a size, open the bag, fill in checkout, and place a test order.

The website must be opened through the hosted HTTPS URL. Opening `index.html` directly with `file://` cannot execute `order.php`.

## Important

The current checkout sends an order notification and confirms the order. It does not process card payments. Add Stripe, PayPal, or another payment provider before accepting paid orders.
