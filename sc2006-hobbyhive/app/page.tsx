import Image from "next/image";
import Link from "next/link";
  import ListingCard from './components/ListingCard';

export default function Home() {
  return (
    <main>
      <div>

        <h1 className="text-cyan-500 text-center text-6xl font-serif">HobbyHive</h1>

      </div>
      <div>

        <Link href="/profile">my profile</Link>
        <br></br>
        <Link href="/events">Events</Link>
        <ListingCard />

      </div>
      </main>
  );
}
