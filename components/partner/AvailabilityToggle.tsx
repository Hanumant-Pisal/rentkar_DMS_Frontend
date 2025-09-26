'use client';
import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { useUpdateAvailability } from "@/hooks/useUpdateAvailability";
import { Loader2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
interface AvailabilityToggleProps {
  isAvailable: boolean;
  className?: string;
}
const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({ 
  isAvailable: initialIsAvailable,
  className = ''
}) => {
  const [localIsAvailable, setLocalIsAvailable] = useState(initialIsAvailable);
  const { mutate: updateAvailability, isPending } = useUpdateAvailability();
  useEffect(() => {
    setLocalIsAvailable(initialIsAvailable);
  }, [initialIsAvailable]);
  const handleToggle = (checked: boolean) => {
    setLocalIsAvailable(checked);
    updateAvailability(checked, {
      onError: () => {
        setLocalIsAvailable(!checked);
      }
    });
  };
  return (
    <div className={`relative flex items-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={localIsAvailable ? 'available' : 'unavailable'}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            localIsAvailable 
              ? 'bg-green-500/20 border border-green-500/30 text-green-100' 
              : 'bg-red-500/20 border border-red-500/30 text-red-100'
          }`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <div className="flex items-center space-x-2">
              {localIsAvailable ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <span className="font-medium text-sm">
                {localIsAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="ml-2">
        <Switch
          checked={localIsAvailable}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label="Toggle availability"
          className={`relative ${
            localIsAvailable 
              ? 'bg-green-500 hover:bg-green-400' 
              : 'bg-red-500 hover:bg-red-400'
          } ${isPending ? 'opacity-70' : ''} shadow-md`}
          style={{
            '--switch-thumb': 'white',
            '--switch-ring': localIsAvailable ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
};
export default AvailabilityToggle;
