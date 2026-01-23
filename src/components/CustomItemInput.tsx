import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Check } from "lucide-react";
import { CustomItem } from "@/lib/calculations";

interface CustomItemInputProps {
  items: CustomItem[];
  onItemsChange: (items: CustomItem[]) => void;
  unitLabel?: string;
  valueLabel?: string;
}

export function CustomItemInput({ 
  items, 
  onItemsChange, 
  unitLabel = "원",
  valueLabel = "금액"
}: CustomItemInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newUnit, setNewUnit] = useState(unitLabel);

  const formatNumber = (value: number) => value.toLocaleString('ko-KR');
  const parseNumber = (value: string) => parseInt(value.replace(/,/g, '')) || 0;

  const handleAdd = () => {
    if (newName.trim() && newValue) {
      const newItem: CustomItem = {
        id: `custom_${Date.now()}`,
        name: newName.trim(),
        value: parseNumber(newValue),
        unit: newUnit,
      };
      onItemsChange([...items, newItem]);
      setNewName("");
      setNewValue("");
      setNewUnit(unitLabel);
      setIsAdding(false);
    }
  };

  const handleRemove = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const handleUpdate = (id: string, value: number) => {
    onItemsChange(items.map(item => 
      item.id === id ? { ...item, value } : item
    ));
  };

  return (
    <div className="space-y-3">
      {/* 기존 커스텀 항목들 */}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 bg-accent/30 p-2 rounded-md">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">{item.name} ({item.unit})</Label>
            <Input
              type="text"
              value={formatNumber(item.value)}
              onChange={(e) => handleUpdate(item.id, parseNumber(e.target.value))}
              className="input-field number-input h-8 text-sm"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleRemove(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* 새 항목 추가 폼 */}
      {isAdding ? (
        <div className="border border-dashed border-primary/50 p-3 rounded-md space-y-2 bg-primary/5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">항목명</Label>
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="예: 추가 자재"
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-xs">{valueLabel}</Label>
              <Input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value.replace(/[^0-9,]/g, ''))}
                placeholder="0"
                className="h-8 text-sm number-input"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              placeholder="단위"
              className="h-8 text-sm w-20"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newName.trim() || !newValue}
              className="h-8"
            >
              <Check className="h-4 w-4 mr-1" />
              추가
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewName("");
                setNewValue("");
              }}
              className="h-8"
            >
              취소
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          항목 추가
        </Button>
      )}
    </div>
  );
}
