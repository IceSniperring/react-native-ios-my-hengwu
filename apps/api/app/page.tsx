export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>hengwu cloud API</h1>
      <p>有数上云 · first cut. See <code>README.md</code>.</p>
      <ul>
        <li>POST /api/migrate</li>
        <li>GET|POST /api/assets</li>
        <li>PATCH|DELETE /api/assets/[id]</li>
      </ul>
    </main>
  );
}
