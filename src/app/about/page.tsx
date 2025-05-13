import { ArrowRight, FileText, MessageSquare, Zap, Shield, Clock, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 grainy">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C7D2FE,transparent)]"></div>
      </div>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-gray-900 sm:text-5xl">
                  About HelloBuddy
                </h1>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Your AI-powered document assistant that makes understanding and working with PDFs easier than ever.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter text-gray-900">
                    Why Choose HelloBuddy?
                  </h2>
                  <p className="text-gray-600">
                    HelloBuddy combines cutting-edge AI technology with user-friendly features to revolutionize how you interact with your documents.
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-start space-x-4">
                    <Brain className="h-6 w-6 text-[#4F46E5]" />
                    <div>
                      <h3 className="font-semibold">Advanced AI Technology</h3>
                      <p className="text-gray-600">Powered by state-of-the-art language models for accurate document understanding and analysis.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Shield className="h-6 w-6 text-[#4F46E5]" />
                    <div>
                      <h3 className="font-semibold">Secure & Private</h3>
                      <p className="text-gray-600">Your documents are encrypted and handled with the utmost security and privacy.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-[#4F46E5]" />
                    <div>
                      <h3 className="font-semibold">Time-Saving</h3>
                      <p className="text-gray-600">Get instant answers to your questions without manually searching through documents.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>How It Works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-[#4F46E5]/10 p-2">
                          <FileText className="h-6 w-6 text-[#4F46E5]" />
                        </div>
                        <div>
                          <h3 className="font-semibold">1. Upload Your PDF</h3>
                          <p className="text-gray-600">Simply upload your PDF document to our secure platform.</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-[#4F46E5]/10 p-2">
                          <Zap className="h-6 w-6 text-[#4F46E5]" />
                        </div>
                        <div>
                          <h3 className="font-semibold">2. AI Processing</h3>
                          <p className="text-gray-600">Our AI analyzes and indexes your document for quick access.</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-[#4F46E5]/10 p-2">
                          <MessageSquare className="h-6 w-6 text-[#4F46E5]" />
                        </div>
                        <div>
                          <h3 className="font-semibold">3. Ask Questions</h3>
                          <p className="text-gray-600">Get instant answers to your questions about the document.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
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
                  Join thousands of users who are already benefiting from HelloBuddy.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                  >
                    Sign Up Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-[#4F46E5] border-[#4F46E5]"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 