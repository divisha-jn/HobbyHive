import Image from "next/image";
import Link from "next/link";
import ListingCard from './components/ListingCard';
import Header from "./components/header";

export default function Home() {
  return (
    <main>
      <Header />
      <div>

        <Link href="/profile">my profile</Link>
        <br />
        <Link href="/events">Events</Link>
        <ListingCard />
        <Link href="/groupchat" className="p-20">temporary route to gc</Link>
      </div>
      </main>
  );
}

