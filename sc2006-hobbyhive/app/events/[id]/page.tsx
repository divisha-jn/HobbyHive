"use client";
import { useParams } from "next/navigation";
import EventListing from "../eventListing/page";

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;

  return <EventListing eventId={eventId}/>;
}