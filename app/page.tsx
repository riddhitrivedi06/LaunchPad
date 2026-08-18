import { supabase } from "@/src/lib/supabase";

export default async function Home() {
  const { data, error } = await supabase
    .from("test_connection")
    .select("*");

  return (
    <main style={{ padding: "40px" }}>
      <h1>LaunchPad</h1>

      <h2>Supabase Connection Test</h2>

      <p>
        {error
          ? `Connection error: ${error.message}`
          : `Supabase connected successfully!`}
      </p>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}