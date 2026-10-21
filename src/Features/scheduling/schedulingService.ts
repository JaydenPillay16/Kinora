
import { supabase } from "../../lib/supabaseClient";
import type { Agent } from "../agents/types";

interface SyncScheduledMessageParams {
  userId: string;
  agent: Agent;
}

export async function syncScheduledMessage({
  userId,
  agent,
}: SyncScheduledMessageParams): Promise<void> {
  // Make sure the signed-in user matches the requested user.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || user.id !== userId) {
    throw new Error(
      "You must be signed in as the correct user to sync scheduled messages.",
    );
  }

  // Let Supabase handle the scheduling logic atomically.
  const { error } = await supabase.rpc(
    "sync_agent_scheduled_message",
    {
      p_agent_id: agent.id,
    },
  );

  if (error) {
    throw new Error(
      `Could not synchronise scheduled message: ${error.message}`,
    );
  }
}
