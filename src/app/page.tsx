import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, MessageSquare, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 grainy">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C7D2FE,transparent)]"></div>
      </div>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter text-gray-900 sm:text-5xl xl:text-6xl/none">
                    Converse with Your Documents
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    HelloBuddy transforms your PDFs into interactive
                    conversations. Upload, ask, and get instant answers.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-[#4F46E5] border-[#4F46E5]"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-[350px] h-[350px] sm:w-[450px] sm:h-[450px]">
                  <Image
                    alt="Hero"
                    className="object-cover rounded-2xl shadow-2xl"
                    fill
                    src="/dashboard-preview.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-gray-900 sm:text-5xl">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our advanced AI technology makes document interaction seamless
                  and efficient.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-[#4F46E5]">1. Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileText className="h-12 w-12 mb-4 text-[#4F46E5]" />
                  <CardDescription className="text-gray-600">
                    Securely upload your PDF documents to our platform.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-[#4F46E5]">2. Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <Zap className="h-12 w-12 mb-4 text-[#4F46E5]" />
                  <CardDescription className="text-gray-600">
                    Our AI analyzes and indexes your document content.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-[#4F46E5]">3. Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <MessageSquare className="h-12 w-12 mb-4 text-[#4F46E5]" />
                  <CardDescription className="text-gray-600">
                    Ask questions and receive instant, accurate answers.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-gray-900 sm:text-5xl">
                  Ready to Get Started?
                </h2>
                <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of users who are already benefiting from
                  HelloBuddy.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                  >
                    Sign Up Now
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-[#4F46E5] border-[#4F46E5]"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          © 2024 HelloBuddy. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
