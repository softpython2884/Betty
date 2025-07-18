'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Loader2, Database, UserPlus } from 'lucide-react';
import { migrateDb, seedDb } from '@/app/actions/db';

export default function DbEditPage() {
  const [loading, setLoading] = useState<'migrate' | 'seed' | null>(null);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleMigrate = async () => {
    setLoading('migrate');
    setResult(null);
    try {
      const res = await migrateDb();
      setResult({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
    } catch (error: any) {
      setResult({
        type: 'error',
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
    setLoading(null);
  };

  const handleSeed = async () => {
    setLoading('seed');
    setResult(null);
    try {
      const res = await seedDb();
      setResult({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
    } catch (error: any) {
      setResult({
        type: 'error',
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
    setLoading(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
          <CardDescription>
            Use these actions to set up or reset your database. Use with
            caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">Run Migrations</h3>
              <p className="text-sm text-muted-foreground">
                Applies schema changes to the DB.
              </p>
            </div>
            <Button onClick={handleMigrate} disabled={!!loading}>
              {loading === 'migrate' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Database className="mr-2 h-4 w-4" />
              )}
              Migrate
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">Seed Database</h3>
              <p className="text-sm text-muted-foreground">
                Creates the initial admin user.
              </p>
            </div>
            <Button onClick={handleSeed} disabled={!!loading}>
              {loading === 'seed' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Seed
            </Button>
          </div>

          {result && (
            <div
              className={`mt-4 p-3 rounded-md text-sm ${
                result.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <p>{result.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
