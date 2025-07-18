"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { User, Mail, KeyRound, CheckCircle, Fingerprint, ShieldQuestion } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  flowUpUuid: z.string().uuid({ message: "Please enter a valid FlowUp User UUID." }),
  fpatToken: z.string().min(10, { message: "Please enter a valid FPAT token." }),
  consent: z.boolean().default(false).refine(value => value === true, {
    message: "You must consent to project creation in your FlowUp workspace.",
  }),
})

export function SignUpForm() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      flowUpUuid: "",
      fpatToken: "",
      consent: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
      title: "Account Created!",
      description: "Welcome to CodeQuest Academy. Logging you in...",
    })
    setTimeout(() => {
        window.location.href = '/dashboard';
    }, 1000)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="Your brave adventurer name" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="you@example.com" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input type="password" placeholder="A strong, secret password" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2 rounded-lg border bg-secondary/50 p-4">
            <h3 className="flex items-center gap-2 font-semibold text-secondary-foreground"><ShieldQuestion size={20} /> FlowUp Integration</h3>
             <FormField
                control={form.control}
                name="flowUpUuid"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>FlowUp User UUID</FormLabel>
                    <div className="relative">
                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                        <Input placeholder="Enter your FlowUp User UUID" {...field} className="pl-10 bg-background" />
                        </FormControl>
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="fpatToken"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>FlowUp FPAT Token</FormLabel>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                        <Input type="password" placeholder="Enter your FPAT token" {...field} className="pl-10 bg-background" />
                        </FormControl>
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>
        
        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                    <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                </FormControl>
                <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" /> I Agree
                    </FormLabel>
                    <FormDescription>
                        I consent to CodeQuest Academy creating private projects in my FlowUp workspace for quests and a secure vault.
                    </FormDescription>
                    <FormMessage/>
                </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full text-lg py-6 mt-6">
          Create My Account
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </div>
      </form>
    </Form>
  )
}
