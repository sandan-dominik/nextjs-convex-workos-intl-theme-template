"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AutumnWrapper } from "@/app/(protected)/_components/autumn-wrapper";
import { useCustomer } from "autumn-js/react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  model: string;
  imageMode: boolean;
  timestamp: Date;
  creditsUsed: number;
}

interface UsageData {
  availableCredits: number;
  usedCredits: number;
  remainingCredits: number;
  usagePercentage: number;
}

export default function ChatPage() {
  const t = useTranslations("chat");
  const [message, setMessage] = useState("");
  const [model, setModel] = useState("gpt-4");
  const [imageMode, setImageMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { customer, check, track, isLoading: customerLoading } = useCustomer();
  
  // Fetch usage data for credits
  const fetchUsageData = useCallback(async () => {
    try {
      if (!customer) return;

      // Remove this line - it's causing the race condition
      // await refetchCustomer();
      
      const { data } = check({ featureId: "credits" });
      console.log('Autumn usage data:', data);
      
      if (data && data.included_usage !== undefined) {
        const availableCredits = data.included_usage;
        const usedCredits = data.usage || 0;
        const remainingCredits = availableCredits - usedCredits;
        const usagePercentage = availableCredits > 0 ? (usedCredits / availableCredits) * 100 : 0;
        
        setUsageData({
          availableCredits,
          usedCredits,
          remainingCredits,
          usagePercentage,
        });
      }
    } catch (err) {
      console.error('Error fetching usage data:', err);
    }
  }, [customer, check]); // Remove refetchCustomer from dependencies

  // Wait for customer to be ready before fetching - only once
  useEffect(() => {
    if (customer && !customerLoading && !hasInitialized) {
      console.log('Customer:', customer);
      console.log('Customer loading:', customerLoading);
      
      const timer = setTimeout(() => {
        fetchUsageData();
        setHasInitialized(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [customer, customerLoading, hasInitialized, fetchUsageData]);

  // Get available credits
  const availableCredits = usageData?.remainingCredits || 0;

  // Calculate credits per message (5 credit per message)
  const creditsPerMessage = 5;
  const canSendMessage = availableCredits >= creditsPerMessage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    if (!canSendMessage) {
      setError(t("insufficientCredits"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create new message
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        model,
        imageMode,
        timestamp: new Date(),
        creditsUsed: creditsPerMessage,
      };

      // Track usage with Autumn - use the messages feature which costs 1 credit
      if (customer) {
        await track({
          featureId: "credits",
          value: 5
        });
        
        setUsageData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            remainingCredits: prev.remainingCredits - creditsPerMessage,
            usedCredits: prev.usedCredits + creditsPerMessage,
          };
        });

       // await fetchUsageData();
      }

      // Add message to chat after usage tracking
      setMessages(prev => [...prev, newMessage]);

      // Clear input
      setMessage("");
      
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `AI response to: "${message}"`,
          model,
          imageMode,
          timestamp: new Date(),
          creditsUsed: 0, // AI responses don't cost credits
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);

    } catch (error) {
      console.error("Error sending message:", error);
      setError(t("failedToSendMessage"));
      
      // Remove the message if usage tracking failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AutumnWrapper loadingVariant="none">
      <div className="flex flex-col gap-4 p-6 h-full">
        {/* Credits Display */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {t("credits")}: {usageData?.remainingCredits} / {usageData?.availableCredits}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {t("used")}: {usageData?.usedCredits}
            </Badge>
            {usageData && (
              <Badge variant="outline" className="text-sm">
                {usageData.usagePercentage.toFixed(1)}% {t("used")}
              </Badge>
            )}
          </div>
          
          {!canSendMessage && (
            <Alert className="w-auto">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {t("insufficientCredits")} <a href="/dashboard/subscription" className="underline">{t("purchaseMore")}</a>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Chat Messages */}
        <Card className="flex-1 p-4 overflow-auto">
          {messages.length === 0 ? (
            <div className="py-8 text-muted-foreground text-center">
              {t("startConversation")}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-2 ${
                    msg.creditsUsed > 0 ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.creditsUsed > 0
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className="flex items-center gap-2 opacity-70 mt-2 text-xs">
                      <span>{msg.model}</span>
                      {msg.imageMode && <span>• Image Mode</span>}
                      {msg.creditsUsed > 0 && (
                        <span>• {msg.creditsUsed} credit{msg.creditsUsed !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={canSendMessage ? t("typeYourMessage") : t("insufficientCredits")}
            className="flex-1"
            disabled={!canSendMessage || isLoading}
          />
          <Button 
            type="submit" 
            disabled={!canSendMessage || isLoading || !message.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                {t("sending")}
              </>
              ) : (
                `${t("send")} (${creditsPerMessage} ${t("credit")})`
              )}
          </Button>
        </form>

        {/* Model and Settings */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("selectModel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch
                id="image-mode"
                checked={imageMode}
                onCheckedChange={setImageMode}
                disabled={!canSendMessage}
              />
              <Label htmlFor="image-mode">{t("imageMode")}</Label>
            </div>
          </div>
        </div>
      </div>
    </AutumnWrapper>
  );
}
