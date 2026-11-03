/* MAX AVE product range — placeholder data shared by all layout demos.
   Prices are indicative (PKR) and should be replaced with real pricing. */
window.MAXAVE = {
  phone: "+92 304 1343605",
  phoneHref: "tel:+923041343605",
  whatsapp: "https://wa.me/923041343605",
  freeShippingOver: 2000,
  shippingFee: 200,
  products: [
    {
      id: "classic",
      name: "Classic 4T",
      grade: "20W-50",
      base: "Mineral",
      color: "red",
      swatch: "#c8202a",
      tag: "Best seller",
      category: "motorcycle",
      fits: "70cc – 125cc commuters",
      short: "Everyday protection for Pakistan's workhorse bikes.",
      long: "A dependable mineral 4-stroke oil with a robust 20W-50 film that holds up in summer heat and stop-start city traffic. Built for CD70, CG125 and similar air-cooled commuters.",
      interval: "2,000 – 2,500 km",
      sizes: [{ label: "0.7 L", price: 1050 }, { label: "1 L", price: 1450 }]
    },
    {
      id: "plus",
      name: "Plus 4T",
      grade: "15W-50",
      base: "Semi-Synthetic",
      color: "blue",
      swatch: "#1f5fbf",
      tag: "Smoother shifts",
      category: "motorcycle",
      fits: "125cc – 200cc",
      short: "Synthetic-blend strength for longer rides and quicker cold starts.",
      long: "A synthetic-blend formula that flows faster at start-up and resists thinning at high temperature. Wet-clutch friendly for crisp, slip-free gear changes.",
      interval: "3,000 – 3,500 km",
      sizes: [{ label: "1 L", price: 1950 }]
    },
    {
      id: "scoot",
      name: "Scoot 4T",
      grade: "10W-40",
      base: "Semi-Synthetic",
      color: "green",
      swatch: "#1f8a5b",
      tag: "For automatics",
      category: "scooter",
      fits: "Scooters & CVT automatics",
      short: "Low-friction care for automatic scooters.",
      long: "Tuned for dry-clutch CVT scooters that run hot and idle often. Lower friction helps fuel economy while additives keep deposits in check.",
      interval: "3,000 km",
      sizes: [{ label: "0.8 L", price: 1350 }, { label: "1 L", price: 1600 }]
    },
    {
      id: "race",
      name: "Race 4T",
      grade: "10W-50",
      base: "Fully Synthetic",
      color: "graphite",
      swatch: "#3a3d42",
      tag: "Performance",
      category: "performance",
      fits: "150cc+ & high-revving engines",
      short: "Full-synthetic film strength for high-rpm riding.",
      long: "Fully synthetic base stocks hold a stable film at sustained high revs and temperatures, keeping power consistent and wear low on sport and touring machines.",
      interval: "5,000 km",
      sizes: [{ label: "1 L", price: 3400 }]
    },
    {
      id: "tour",
      name: "Tour 4T",
      grade: "20W-50",
      base: "High-Mileage",
      color: "amber",
      swatch: "#d9822b",
      tag: "Older engines",
      category: "motorcycle",
      fits: "Bikes over 30,000 km",
      short: "Seal conditioners for engines with miles behind them.",
      long: "Extra seal conditioners and anti-wear additives help reduce oil burning and leaks in older engines, restoring a quieter, smoother running feel.",
      interval: "2,000 – 2,500 km",
      sizes: [{ label: "1 L", price: 1650 }]
    },
    {
      id: "twot",
      name: "Pro 2T",
      grade: "2-Stroke",
      base: "Semi-Synthetic",
      color: "violet",
      swatch: "#6b3fb3",
      tag: "Low smoke",
      category: "two-stroke",
      fits: "2-stroke bikes & equipment",
      short: "Clean-burning two-stroke oil with low smoke.",
      long: "Mixes readily with petrol and burns cleanly to cut smoke and spark-plug fouling, while protecting pistons and bearings in premix and auto-lube systems.",
      interval: "Per mixing ratio",
      sizes: [{ label: "0.7 L", price: 950 }]
    }
  ],
  img(p, side, prefix) {
    return (prefix || "../assets/bottles/") + (side || "front") + "-" + p.color + ".png";
  },
  rs(n) {
    return "Rs " + n.toLocaleString("en-PK");
  },
  find(id) {
    return this.products.find((p) => p.id === id);
  }
};
