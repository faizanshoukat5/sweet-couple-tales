import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface User {
  user_id: string;
  email: string;
}

const SelectPartner = ({ onSelect }: { onSelect: (partnerId: string) => void }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, email")
        .neq("user_id", user.id); // Exclude current user

      if (!error && Array.isArray(data)) {
        setUsers(data.filter((u: any) => u && typeof u.user_id === 'string' && typeof u.email === 'string'));
      } else {
        setUsers([]);
        setError("Failed to load users.");
      }
      setLoading(false);
    };
    fetchUsers();
  }, [user && user.id]);

  const handleSelect = async () => {
    setError(null);
    setSuccess(null);
    if (!selectedId) return;
    // Prevent duplicate couple relationships
    const { data: existing, error: fetchError } = await supabase
      .from("couples")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .or(`user1_id.eq.${selectedId},user2_id.eq.${selectedId}`);
    if (fetchError) {
      console.error('Fetch couples error:', fetchError);
      setError("Failed to check existing relationship.");
      return;
    }
    if (existing && existing.length > 0) {
      setError("You already have a partner relationship set.");
      return;
    }
    // Upsert couple relationship
    const { error: upsertError } = await supabase.from("couples").upsert({
      user1_id: user.id,
      user2_id: selectedId,
    }, { onConflict: 'user1_id,user2_id' });
    if (upsertError) {
      console.error('Upsert couples error:', upsertError);
      setError(upsertError.message || "Failed to set partner.");
      return;
    }
    setSuccess("Partner set successfully!");
    onSelect(selectedId);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow">
        <div>Loading user...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
          {success}
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
          <span className="text-muted-foreground">Loading available partners...</span>
        </div>
      ) : (
        <div className="space-y-3">
          <select
            className="w-full border border-border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">Choose your partner...</option>
            {users.length === 0 ? (
              <option value="" disabled>
                No partners available. Ask your partner to register first!
              </option>
            ) : (
              users.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  {u.email}
                </option>
              ))
            )}
          </select>
          
          {users.length === 0 && (
            <div className="text-center p-4 bg-muted/50 rounded-lg border border-dashed">
              <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">No partners found</p>
              <p className="text-xs text-muted-foreground">
                Ask your partner to create an account first, then refresh this page.
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleSelect} 
            disabled={!selectedId || loading}
            className="w-full"
            variant="romantic"
          >
            {loading ? "Connecting..." : "Confirm Partner Selection"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectPartner;
