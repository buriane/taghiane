"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  SplitSquareVertical,
  FileText,
  Scan,
  Edit,
  Check,
  ArrowRight
} from "lucide-react";

export default function Home() {
  // State untuk animasi hover pada fitur card
  const [, setIsHovered] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animasi fadeIn saat komponen dimuat
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: SplitSquareVertical,
      title: "Unggah Foto Nota",
      description:
        "Upload foto struk dari kamera atau galeri dengan mudah dan cepat",
      color: "bg-sky-600",
    },
    {
      icon: Scan,
      title: "Ekstraksi OCR",
      description: "Teknologi canggih untuk mengenali semua item dan harga secara otomatis",
      color: "bg-blue-500",
    },
    {
      icon: Edit,
      title: "Edit Hasil Scan",
      description: "Koreksi hasil scan dengan mudah untuk memastikan akurasi data",
      color: "bg-indigo-500",
    },
    {
      icon: Receipt,
      title: "Split Bill Mudah",
      description: "Tentukan dengan tepat siapa membayar menu apa, bahkan untuk item yang dibagi",
      color: "bg-sky-700",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
        <div className="bg-orb bg-orb-4"></div>
      </div>

      {/* Hero Section */}
      <section className={`relative h-screen flex items-center justify-center pt-16 transition-opacity duration-1000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-6 max-w-4xl pt-12">
          <div className="flex flex-col items-center text-center">
            {/* App Logo at Top */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-10 relative">
              {/* App Logo & Animation */}
              <div className="logo-container scale-150">
                <div className="radar-ring"></div>
                <div className="radar-ring"></div>
                <div className="radar-ring"></div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                    mass: 1
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 rounded-2xl shadow-lg flex items-center justify-center logo-pulse cursor-pointer">
                  <Receipt className="w-10 h-10 text-white" />
                </motion.div>
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-3 mb-6 pt-8">
              <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-1.5 rounded-full">
                <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-800 dark:text-blue-300">OCR powered</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent tracking-tight leading-tight mb-8">
              Split Bill Jadi Mudah
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-lg dark:text-gray-300 text-gray-700 font-medium max-w-2xl mb-10">
              Taghiane membantu Anda membagi tagihan dengan teman secara cepat dan adil. Cukup unggah foto nota, dan biarkan AI kami menganalisa semuanya untuk Anda.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="mb-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link href="/scan" className="px-8 py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group">
                  Mulai Split Bill
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features-section" className="relative py-28 min-h-screen flex items-center bg-gray-50/30 dark:bg-zinc-900/30 backdrop-filter backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-6 w-full">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12">
            <h2 className="text-3xl font-bold dark:text-gray-100 text-gray-800 mb-3 tracking-tight">
              Split Bill dengan Teknologi Canggih
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Fitur unggulan yang membuat Taghiane menjadi solusi terbaik untuk membagi tagihan bersama teman
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -8 }}
                key={index}
                className="dark:bg-zinc-800/80 bg-white backdrop-blur-sm dark:border-zinc-700 border-gray-100 border rounded-2xl p-6 shadow-md hover:shadow-xl group cursor-pointer"
                onMouseEnter={() => setIsHovered(index)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <motion.div
                  className="mb-4"
                  transition={{ duration: 0.5 }}>
                  <div
                    className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
                <h3 className="font-semibold dark:text-white text-gray-800 text-lg mb-2 dark:group-hover:text-white group-hover:text-gray-900 transition-colors tracking-tight">
                  {feature.title}
                </h3>
                <p className="dark:text-gray-400 text-gray-600 text-sm leading-relaxed font-normal">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-28 min-h-screen flex items-center backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl px-6 w-full">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12">
            <motion.div
              transition={{ duration: 0.8 }}
              className="mx-auto w-16 h-16 dark:bg-blue-900/30 bg-blue-100 rounded-full flex items-center justify-center shadow-md mb-6">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <h2 className="text-3xl font-bold dark:text-gray-100 text-gray-800 mb-4 tracking-tight">
              Cara Kerja Taghiane
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="dark:bg-zinc-800/40 bg-white/60 backdrop-blur-sm dark:border-zinc-700 border-gray-100 border rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <motion.div
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </motion.div>
                <div>
                  <h3 className="font-semibold dark:text-white text-gray-800 mb-2">Unggah Foto Struk</h3>
                  <p className="dark:text-gray-300 text-gray-600 text-sm">
                    Ambil foto struk dari kamera atau pilih dari galeri Anda
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="dark:bg-zinc-800/40 bg-white/60 backdrop-blur-sm dark:border-zinc-700 border-gray-100 border rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <motion.div
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </motion.div>
                <div>
                  <h3 className="font-semibold dark:text-white text-gray-800 mb-2">Ekstrak Data Otomatis</h3>
                  <p className="dark:text-gray-300 text-gray-600 text-sm">
                    OCR akan mengenali item, harga, pajak, dan total secara otomatis
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="dark:bg-zinc-800/40 bg-white/60 backdrop-blur-sm dark:border-zinc-700 border-gray-100 border rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <motion.div
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-white font-bold">3</span>
                </motion.div>
                <div>
                  <h3 className="font-semibold dark:text-white text-gray-800 mb-2">Tambahkan Peserta</h3>
                  <p className="dark:text-gray-300 text-gray-600 text-sm">
                    Masukkan nama peserta yang terlibat dalam pembagian tagihan
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="dark:bg-zinc-800/40 bg-white/60 backdrop-blur-sm dark:border-zinc-700 border-gray-100 border rounded-2xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <motion.div
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-sky-700 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-white font-bold">4</span>
                </motion.div>
                <div>
                  <h3 className="font-semibold dark:text-white text-gray-800 mb-2">Lihat Hasil & Bagikan</h3>
                  <p className="dark:text-gray-300 text-gray-600 text-sm">
                    Dapatkan rangkuman siapa membayar berapa dan bagikan dengan teman
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex justify-center mt-12">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link href="/scan" className="px-6 py-3 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 font-medium flex items-center justify-center gap-2 hover:shadow-md transition-all duration-300 group">
                Coba Sekarang
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Taghiane. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
