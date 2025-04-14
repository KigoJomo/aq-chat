import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to /chat which is the main application entry point
  redirect('/chat');
}
