"use client";

import React from "react";
import { Target } from "lucide-react";
import { InvestmentGoal } from "../../types";

interface InvestmentGoalsSectionProps {
  goals: InvestmentGoal[];
  onOpenNewGoal: () => void;
}

export default function InvestmentGoalsSection({ goals, onOpenNewGoal }: InvestmentGoalsSectionProps) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Target size={16} className="text-primary" /> Investment Goals
        </h3>
        <button 
          type="button"
          onClick={onOpenNewGoal}
          className="text-xs text-primary font-bold hover:underline cursor-pointer"
        >
          + Add Goal
        </button>
      </div>
      <div className="space-y-4">
        {goals.map(goal => (
          <div key={goal.id}>
            <div className="flex justify-between items-end mb-1.5">
              <p className="text-on-surface text-xs font-bold">{goal.name}</p>
              <span className="text-primary text-xs font-mono font-bold">{goal.percentAchieved}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mb-1">
              <div className={`h-full rounded-full ${goal.percentAchieved >= 75 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${goal.percentAchieved}%` }}></div>
            </div>
            <p className="text-on-surface-variant text-[11px] font-mono">₹{goal.currentAmount.toLocaleString('en-IN')} of ₹{goal.targetAmount.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
