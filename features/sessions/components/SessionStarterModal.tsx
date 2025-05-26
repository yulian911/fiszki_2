"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Settings } from "lucide-react";
import { toast } from "sonner";

interface FlashcardsSet {
  id: string;
  name: string;
  description?: string;
  flashcardCount: number;
}

interface Tag {
  id: string;
  name: string;
}

interface SessionStarterModalProps {
  triggerButton?: React.ReactNode;
}

export default function SessionStarterModal({ triggerButton }: SessionStarterModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  // Form state
  const [selectedSetId, setSelectedSetId] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [limit, setLimit] = useState<number>(10);
  const [shuffle, setShuffle] = useState<boolean>(true);
  
  // Data state
  const [flashcardsSets, setFlashcardsSets] = useState<FlashcardsSet[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Load available flashcards sets and tags when modal opens
  useEffect(() => {
    if (open && flashcardsSets.length === 0) {
      loadAvailableData();
    }
  }, [open]);

  const loadAvailableData = async () => {
    setLoadingData(true);
    try {
      // Load flashcards sets (paginowane dane)
      const setsResponse = await fetch("/api/flashcards-sets?limit=100");
      if (setsResponse.ok) {
        const setsData = await setsResponse.json();
        // API zwraca obiekt z data array
        setFlashcardsSets(setsData.data || []);
      }

      // Load available tags
      const tagsResponse = await fetch("/api/tags");
      if (tagsResponse.ok) {
        const tags = await tagsResponse.json();
        setAvailableTags(tags || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load available sets and tags");
    } finally {
      setLoadingData(false);
    }
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const isStartButtonDisabled = () => {
    if (loading || !selectedSetId) return true;
    
    const selectedSet = flashcardsSets.find(set => set.id === selectedSetId);
    if (!selectedSet) return true;
    
    if (selectedSet.flashcardCount === 0) return true;
    
    return false;
  };

  const handleStartSession = async () => {
    if (!selectedSetId) {
      toast.error("Please select a flashcards set");
      return;
    }

    const selectedSet = flashcardsSets.find(set => set.id === selectedSetId);
    if (!selectedSet) {
      toast.error("Selected set not found");
      return;
    }

    if (selectedSet.flashcardCount === 0) {
      toast.error("Cannot start session: The selected set has no cards");
      return;
    }

    if (limit < 1 || limit > 100) {
      toast.error("Limit must be between 1 and 100");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          flashcardsSetId: selectedSetId, 
          tags: selectedTags, 
          limit,
          shuffle 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create session");
      }

      const data = await response.json();
      const sessionId = data.sessionId;
      
      // Don't reset form or close modal immediately to maintain loading state
      // Close modal only after successful redirect
      router.push(`/protected/sessions/${sessionId}`);
      toast.success("Session started successfully!");
      
      // Reset after a brief delay to ensure navigation starts
      setTimeout(() => {
        setOpen(false);
        resetForm();
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start session");
      setLoading(false); // Reset loading only on error
    }
  };

  const resetForm = () => {
    setSelectedSetId("");
    setSelectedTags([]);
    setLimit(10);
    setShuffle(true);
  };

  const defaultTrigger = (
    <Button size="lg" className="gap-2">
      <Play className="w-4 h-4" />
      Start New Session
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configure New Session
          </DialogTitle>
        </DialogHeader>
        
        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading available sets and tags...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Flashcards Set Selection */}
            <div className="space-y-2">
              <Label htmlFor="flashcards-set">Flashcards Set *</Label>
              <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a flashcards set..." />
                </SelectTrigger>
                <SelectContent>
                  {flashcardsSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      <div className="w-full">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{set.name}</span>
                          <Badge variant={set.flashcardCount === 0 ? "destructive" : "secondary"} className="ml-2">
                            {set.flashcardCount} {set.flashcardCount === 1 ? 'card' : 'cards'}
                          </Badge>
                        </div>
                        {set.description && (
                          <div className="text-xs text-muted-foreground">{set.description}</div>
                        )}
                        {set.flashcardCount === 0 && (
                          <div className="text-xs text-destructive mt-1">⚠️ No cards available in this set</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSetId && flashcardsSets.find(set => set.id === selectedSetId)?.flashcardCount === 0 && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  ⚠️ The selected set has no cards. Please add some cards first or choose a different set.
                </div>
              )}
            </div>

            {/* Tags Selection */}
            <div className="space-y-2">
              <Label>Tags (optional)</Label>
              <div className="min-h-[40px] max-h-[100px] overflow-y-auto border rounded-md p-2">
                {availableTags.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No tags available</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag.name)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {selectedTags.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Selected: {selectedTags.join(", ")}
                </div>
              )}
            </div>

            {/* Limit */}
            <div className="space-y-2">
              <Label htmlFor="limit">Number of Cards (1-100) *</Label>
              <Input
                id="limit"
                type="number"
                min={1}
                max={100}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              />
              {selectedSetId && (() => {
                const selectedSet = flashcardsSets.find(set => set.id === selectedSetId);
                return selectedSet && limit > selectedSet.flashcardCount ? (
                  <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    ⚠️ Requested {limit} cards but set only has {selectedSet.flashcardCount} cards. 
                    The session will use all available cards.
                  </div>
                ) : null;
              })()}
            </div>

            {/* Shuffle Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shuffle"
                checked={shuffle}
                onCheckedChange={(checked) => setShuffle(!!checked)}
              />
              <Label htmlFor="shuffle" className="text-sm">
                Shuffle cards randomly
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartSession}
                className="flex-1 gap-2"
                disabled={isStartButtonDisabled()}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Start Session
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 