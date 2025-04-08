export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id

  return (
    <section>
      <h4>Dynamic chat page.</h4>

      <p>Id: {id}</p>
    </section>
  )
}