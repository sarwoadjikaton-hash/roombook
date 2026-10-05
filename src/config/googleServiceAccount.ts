export interface GoogleServiceAccountConfig {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

export const GOOGLE_SERVICE_ACCOUNT: GoogleServiceAccountConfig = {
  type: "service_account",
  project_id: "ruangku-510707",
  private_key_id: "fd45f191eb469ced8cb256602913a57a0c3d10ea",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCnE28n5g8hMTEy\ntgbMKVB1wHp/lfIdVE6fET3d9RDp/Xns7ym3hs9Tc8KJBFx+RcXDV5xZS2eJLHbw\nmw32I1F7qq/jZbIigXIlQrYls/XawPw95g6zXgq37z8xTOdDgjAFtuEvsNgx5c2y\n+FYesT4K+OPvZqf7a/TntRrHKt1nu6l5l8UYtoyIW1yQHNXx/8yjwVjRlIkm1Qzr\n5Gj6dbjB5qVTc2ag3KLYzwW5+A/usrXqmuVsI08mMrsIURANKFZWHo1xeijIPRxp\njB8BjHlMC/HnMJVHptloNvDwYnXXDSQEmDgwZTONZYkKCAZ1EBA9+rQBEwIfiNUn\n+ijOeLuXAgMBAAECggEAO0va8fqlGP8n+lr/G5t4GmqHL1vs03r18l+AqRNOfvU+\nvhf9osyeLXySqOVa3FfwAc3IyCpKYzVcOzWUpWxQgYcJKLgRmkx90fqUwdnWYl6G\nx4MsaX1xaWlocJteIqgEWirXTgFCIadxM1kO25LFNciywOcarFFa2Jd+mvw8GxG9\nHUZPXKmcIg5QTe996coRYREfFwKSKdUSZ28U5FHdEm3U9qFShQgZPGrZvsCTTuCI\nHOjatNQ6layck4eh2uPneVX8mEuPjGqyyejBfU2g5l1Iptn8CqVBChK0kLyt7gYR\nZ9TkS340QrF1lfdHAbfOPXGSXJtGtr90FpCeGbCmlQKBgQDQBG+rJ0Et/69+LRiM\nfIpJEL6DcCW4ZmOvEWezqziYH0AMGdGkkDofgtF3jZIB9qNEMw+ss2/pSflQvgDW\ngDTzQF3qK1tAzs0dY+7mGRKV7LyDa5C1imtkbnoPsYLl6mu9WIZgCfoA4MAtcYKh\njSMi17cLrFKY+Kh5uI7o57XvLQKBgQDNnWE9ItD7aktwXZIl8xWrbSqCZFkG0i6t\nVzAsMz8/VB3f3+wXuQd7QdN3NS8BkMHjhEyPyjqcVjcn+d3J3Ubrp0h7tt35+bAa\n+JwZzFv+MdMtIFN8elPVcRerP+IXgK5faiT7mjzR/x/X5VAvSf5I4A5bPFw3n5on\n06JW8IrwUwKBgC8t0mXvMUlNhHAJqleyp2qK8aq99NAt6M38FJkbbGqUK+KSuImq\nbIRZF0kWQtdPKRh+vD9fMzKmJHW7olUEHv5MywAhdUDtpnfUAosNhLmcR+VGsDt8\neX79z5FfoWCkGmuHeHKv0JQCZZPo+sfJSv7MDigHnXQ0cYGp6j/IzerBAoGBAKjO\nlZ+oruRKf0bwO2WWrerAxE6q7gBQnOvJEg6nwDxQ5foAEAfl68OA5okPC9mAK/6L\nhoPipr3ldoEGfdUWKvybqUGQf6uUF8X858OyaLBH3bVFveULVTp+D82TtB5RkldZ\ngKVkGpzZlR4d8PfyCqdv87lp09gC23/pG3W/JIJrAoGAN5lE51P4G14x+KLbdpNI\n6ooDxSPmxcugflZ6E+v16kov2MxPpIYO/ejyZ23OVu/jwfQ06+s+WhxtGX2tqb9q\nHIZ/rOOeJARH1MeU2u3YNotSX+0gTZokz8T6SY1JDE8beNBWurk3q5dtPwlGVsh3\nKijBkCW5hmwqMkfAUmSjWTU=\n-----END PRIVATE KEY-----\n",
  client_email: "ruangku-calendar-sync@ruangku-510707.iam.gserviceaccount.com",
  client_id: "108206338230227802054",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/ruangku-calendar-sync%40ruangku-510707.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};
