import { createClient } from '@libsql/client';

const url = "libsql://opticoreph-opticoreph.aws-ap-northeast-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzUyMzcwNjAsImlkIjoiMDE5ZDU0NWYtOWUwMS03YTdkLWE5MjEtNjdjMjgxYWQ0MjU2IiwicmlkIjoiNmYzN2E2MDYtZmNlNC00YjA1LTg1MWMtYTA5YzEzNDYzYmNhIn0.htRY_IcO4fgocPuPgVjUaCaKfzezRWW63ndLoOQbD5ysiiJYdrWotkRPOTqu-AORfXTQW590djXHVyZpbSVSDg";

const client = createClient({ url, authToken });

async function check() {
  try {
    const res = await client.execute("PRAGMA table_info(Client);");
    console.log("Client columns:", res.rows.map(r => r.name));
  } catch (err) {
    console.error(err);
  }
}

check();
