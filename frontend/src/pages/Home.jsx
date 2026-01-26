import React from 'react'
import TopBar from '../components/TopBar'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Trust from '../components/Trust'
import Metrics from '../components/Metrics'
import FeaturedProjects from '../components/FeaturedProjects'
import SearchPreview from '../components/SearchPreview'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content">
        <Hero />
        <HowItWorks />
        <Trust />
        <Metrics />
        <FeaturedProjects />
        <SearchPreview />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
