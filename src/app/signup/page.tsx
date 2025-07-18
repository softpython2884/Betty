import { GraduationCap } from 'lucide-react';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-4xl">Join the Guild</CardTitle>
            <CardDescription className="pt-2 text-base">Create your account to start your coding adventure.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <SignUpForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
