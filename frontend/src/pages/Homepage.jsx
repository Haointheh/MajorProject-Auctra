import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import CardType2 from '../ui/CardType2'
import ceramics from '../assets/ceramics.jpg'
import handicraft from '../assets/handicraft.jpg'
import art from '../assets/art.jpg'
import antiques from '../assets/antiques.jpg'
import fashion from '../assets/fashion.jpg'
import jewellery from '../assets/jewellery.jpg'
import logo from "../assets/auctra_logo.svg";
import { CATEGORIES } from "../data/categories";
import AboutFeatureCard from '../ui/AboutFeatureCard'
import khukuri from '../assets/khukuri.jpg'

const ABOUT_FEATURES = [
  {
    title: "Secure Bidding",
    description:
      "Refundable collateral deposits discourage fake bids and promote fair competition.",
  },
  {
    title: "Verified Sellers",
    description:
      "Seller identity verification through KYC builds confidence for every auction.",
  },
  {
    title: "AI Verification",
    description:
      "AI-assisted checks help identify suspicious listings and support authenticity verification.",
  },
  {
    title: "Transparent Auctions",
    description:
      "Real-time bidding, notifications, and clear auction rules keep every participant informed.",
  },
];

export default function Homepage() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-neutral1 text-neutral9">

        {/* Hero */}
        <section
          className="relative overflow-hidden py-20"
          style={{ backgroundImage: `url(${ceramics})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {/* <div className="absolute inset-0 bg-slate-950/75" /> */}
          <div className="absolute inset-0 bg-linear-to-r from-slate-950/80 via-slate-950/65 to-transparent" />

          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl text-center lg:text-left">
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">Discover Collateral Based Auctions here on Auctra</h1>
              <p className="text-slate-200 max-w-2xl mx-auto lg:mx-0 mb-6">We connect buyers and collectors to rare, high-quality items sourced from trusted sellers around the world.</p>

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Button variant="secondary" size="md" onClick={() => navigate("/browse")}>Browse Auctions</Button>
                <Button variant="blank" size="md" className="bg-white/50! text-white! hover:text-inherit!"
                 onClick={() => navigate("/terms")}>Learn More</Button>
              </div>
            </div>
          </div>
        </section>

      {/* What We Are Sourcing */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-primary mb-6">What We Are Sourcing</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

{CATEGORIES.slice(0, 4).map((cat) => (
            <CardType2
              key={cat.slug}
              title={cat.label}
              tag={cat.tag}
              description={cat.description}
              imageUrl={cat.imageUrl}
              // onClick={() => navigate(`/auctions/${cat.slug}`)}
            />
          ))}

          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/browse")}
              className="text-sm text-neutral7 font-semibold hover:underline"
            >
              View all categories →
            </button>
          </div>
        </div>
      </section>

      {/* About Auctra */}
{/* About Auctra */}
<section id="about-us" className="relative overflow-hidden py-20">

  {/* Background watermark */}
  <img
    src={logo}
    alt=""
    className="
      absolute
      bottom-0
      left-1/2
      -translate-x-1/2
      w-225
      max-w-none
      opacity-5
      pointer-events-none
      select-none
    "
  />

  <div className="relative mx-auto max-w-6xl px-6">

    <div className="grid lg:grid-cols-2 gap-12 items-center">

      {/* Left content */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-3">
          About Auctra
        </p>

        <h2 className="text-3xl font-bold text-slate-900 mb-6">
          A modern auction platform built on trust, transparency, and security.
        </h2>

        <p className="text-slate-600 leading-8 mb-6">
          Auctra is a digital marketplace designed for buying and selling
          high-value collectibles, antiques, artwork, luxury goods, and other
          unique items through secure online auctions. Every auction is
          supported by features that promote fair competition while protecting
          both buyers and sellers.
        </p>

        <p className="text-slate-600 leading-8">
          To encourage genuine bidding, Auctra requires buyers to place a
          refundable collateral deposit before participating in live auctions.
          Sellers complete identity verification through KYC, while AI-assisted
          verification helps detect potentially fraudulent listings and improve
          marketplace trust.
        </p>
      </div>


      {/* Right bidding image */}
      <div className="relative">

        <img
          // src={khukuri}
          // src="https://images.unsplash.com/photo-1658576274419-4924db4962e0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          src="https://media.istockphoto.com/id/2230883225/photo/yak-tail-hair-selling-in-local-market-in-kathmandu-nepal.jpg?s=2048x2048&w=is&k=20&c=p3b48UKUU_0xFulODy1ydoFWvYgABiBEFT9RUsVgGSM="
          alt="Auction bidding"
          className="
            w-full
            h-105
            object-cover
            shadow-xl
          "
        />

        {/* Image overlay card */}
        <div className="
          absolute
          bottom-6
          left-6
          bg-white
          shadow-lg
          p-5
          max-w-xs opacity-75
        ">
          <p className="text-xs uppercase tracking-widest font-bold text-primary mb-1">
            Live Auctions
          </p>

          <p className="text-sm text-slate-600">
            Secure bidding experiences connecting collectors and trusted sellers.
          </p>
        </div>

      </div>

    </div>


    {/* Feature Cards */}
    <div className="relative grid gap-6 mt-12 md:grid-cols-4">
      {ABOUT_FEATURES.map((feature) => (
        <AboutFeatureCard
          key={feature.title}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </div>

  </div>

</section>

      {/* Contact Us */}
      <section className="py-12 bg-neutral2">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-xl font-bold text-primary mb-2">Contact Us</h2>
          <p className="text-neutral7 mb-6">Have questions or want to list an item? Send us a message and we'll get back to you.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input placeholder="Your name" className="p-3 border border-neutral4" />
            <input placeholder="Your email" className="p-3 border border-neutral4" />
            <input placeholder="Subject" className="p-3 border border-neutral4" />
          </div>

          <div className="mt-4">
            <textarea placeholder="Message" className="w-full p-3 border border-neutral4" rows={4} />
          </div>

          <div className="mt-4">
            <Button variant="primary" size="medium">Send Message</Button>
          </div>
        </div>
      </section>
    </main>
  )
}
