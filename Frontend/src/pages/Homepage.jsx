import React from 'react'
import Button from '../ui/Button'
import CardType2 from '../ui/CardType2'
import ceramics from '../assets/ceramics.jpg'

const categories = ['Art', 'Vehicles', 'Jewellery', 'Vintage']

export default function Homepage() {
  return (
    <main className="min-h-screen bg-neutral1 text-neutral9">
      {/* Hero */}
      {/* <section className="relative overflow-hidden from-primary/10 to-secondaryd/5 py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Discover Unique Auctions on Auctra</h1>
            <p className="text-neutral7 max-w-2xl mx-auto lg:mx-0 mb-6">We connect buyers and collectors to rare, high-quality items sourced from trusted sellers around the world.</p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button variant="secondary" size="md">Browse Auctions</Button>
              <Button variant="blank" size="md">Learn More</Button>
            </div>
          </div>

          <div className="w-full max-w-md overflow-hidden border border-slate-200 bg-white shadow-xl">
            <img src={ceramics} alt="Ceramics" className="h-full w-full object-cover" />
          </div>
        </div>
      </section> */}


        {/* Hero */}
        <section
          className="relative overflow-hidden py-20"
          style={{ backgroundImage: `url(${ceramics})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-slate-950/75" />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl text-center lg:text-left">
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">Discover Collateral Based Auctions here on Auctra</h1>
              <p className="text-slate-200 max-w-2xl mx-auto lg:mx-0 mb-6">We connect buyers and collectors to rare, high-quality items sourced from trusted sellers around the world.</p>

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Button variant="secondary" size="md">Browse Auctions</Button>
                <Button variant="blank" size="md" className="bg-white/50! text-white! hover:text-inherit!">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

      {/* What We Are Sourcing */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-primary mb-6">What We Are Sourcing</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <CardType2
  title="Vintage Watch"
  description="Rare 1960s Rolex in mint condition"
  imageUrl="/images/watch.jpg"
  tag="lol"
/>

<CardType2
  title="Vintage Watch"
  description="Rare 1960s Rolex in mint condition"
  imageUrl="/images/watch.jpg"
  tag="Hot"
/>

<CardType2
  title="Vintage Watch"
  description="Rare 1960s Rolex in mint condition"
  imageUrl="/images/watch.jpg"
  tag="Hot"
/>

<CardType2
  title="Vintage Watch"
  description="Rare 1960s Rolex in mint condition"
  imageUrl="/images/watch.jpg"
  tag="Hot"
/>
          </div>

          <div className="mt-8 text-center">
            <span className="text-sm text-neutral7">View all categories</span>
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
