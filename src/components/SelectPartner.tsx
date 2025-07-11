import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

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
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow">
      <h2 className="font-serif text-2xl font-bold mb-4">Select Your Partner</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <>
          <select
            className="w-full border rounded px-3 py-2 mb-4"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">Choose a partner...</option>
            {users.length === 0 ? (
              <option value="" disabled>No partners available. Ask your partner to register!</option>
            ) : (
              users.map(u => (
                <option key={u.user_id} value={u.user_id}>{u.email}</option>
              ))
            )}
          </select>
          <Button onClick={handleSelect} disabled={!selectedId || loading}>
            {loading ? "Processing..." : "Confirm Partner"}
          </Button>
        </>
      )}
    </div>
  );
};

export default SelectPartner;
