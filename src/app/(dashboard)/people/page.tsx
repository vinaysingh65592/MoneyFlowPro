import { getPeople, getAllSettlements } from "@/actions/people";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { AddPersonDialog } from "@/components/people/add-person-dialog";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function PeoplePage(props: {
  searchParams: Promise<{ search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search;
  
  const settlements = await getAllSettlements();
  const allPeople = await getPeople();

  const peopleData = allPeople.map(person => {
    const settlement = settlements.find(s => s.person.id === person.id);
    return {
      ...person,
      netSettlement: settlement?.netSettlement || 0
    };
  }).filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">People</h1>
          <p className="text-muted-foreground">Manage money lent, borrowed, and shared expenses.</p>
        </div>
        <AddPersonDialog />
      </div>

      {peopleData.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground mb-4">No people added yet.</p>
          <p className="text-sm text-muted-foreground mb-6">Add people to track money lent, borrowed, and shared expenses.</p>
          <AddPersonDialog />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {peopleData.map((person) => (
            <Link key={person.id} href={`/people/${person.id}`}>
              <Card className="hover:bg-muted/50 transition-colors h-full">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{person.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium leading-none">{person.name}</h3>
                        {person.relationship && (
                          <Badge variant="secondary">{person.relationship}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {person.netSettlement > 0 ? (
                          <span className="text-emerald-500 font-medium">Receivable: {formatCurrency(person.netSettlement)}</span>
                        ) : person.netSettlement < 0 ? (
                          <span className="text-rose-500 font-medium">Payable: {formatCurrency(Math.abs(person.netSettlement))}</span>
                        ) : (
                          <span>Settled up</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
