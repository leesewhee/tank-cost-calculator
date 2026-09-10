import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Check, AlertTriangle } from "lucide-react";
import { CustomItem } from "@/lib/calculations";

interface CustomItemInputProps {
  items: CustomItem[];
  onItemsChange: (items: CustomItem[]) => void;
  unitLabel?: string;
  valueLabel?: string;
  /** 단가형 항목: 수량/공수를 함께 입력받아 단가 × 수량으로 계산 */
  withQuantity?: boolean;
  quantityLabel?: string;
  hint?: string;
}

export function CustomItemInput({
  items,
  onItemsChange,
  unitLabel = "원",
  valueLabel = "금액",
  withQuantity = false,
  quantityLabel = "수량",
  hint,
}: CustomItemInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newUnit, setNewUnit] = useState(unitLabel);

  const formatNumber = (value: number) => value.toLocaleString("ko-KR");
  const parseNumber = (value: string) => parseInt(value.replace(/,/g, "")) || 0;

  const handleAdd = () => {
    if (!newName.trim() || !newValue) return;
    const qty = parseFloat(newQty);
    const newItem: CustomItem = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      value: parseNumber(newValue),
      unit: newUnit,
      ...(withQuantity ? { quantity: isFinite(qty) && qty > 0 ? qty : undefined } : {}),
    };
    onItemsChange([...items, newItem]);
    setNewName("");
    setNewValue("");
    setNewQty("");
    setNewUnit(unitLabel);
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const handleUpdate = (id: string, patch: Partial<CustomItem>) => {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-3">
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {items.map((item) => {
        const missingQty = withQuantity && (!item.quantity || item.quantity <= 0);
        return (
          <div key={item.id} className="bg-accent/30 p-2 rounded-md space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">
                  {item.name} ({withQuantity ? `원/${item.unit}` : item.unit})
                </Label>
                <Input
                  type="text"
                  value={formatNumber(item.value)}
                  onChange={(e) => handleUpdate(item.id, { value: parseNumber(e.target.value) })}
                  className="input-field number-input h-8 text-sm"
                />
              </div>
              {withQuantity && (
                <div className="w-24">
                  <Label className="text-xs text-muted-foreground">{quantityLabel}</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={item.quantity ?? ""}
                    placeholder="필수"
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      handleUpdate(item.id, { quantity: isFinite(v) && v > 0 ? v : undefined });
                    }}
                    className={`input-field number-input h-8 text-sm ${missingQty ? "border-destructive" : ""}`}
                  />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleRemove(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {missingQty && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {quantityLabel}을(를) 입력해야 견적 금액에 반영됩니다.
              </p>
            )}
          </div>
        );
      })}

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
                onChange={(e) => setNewValue(e.target.value.replace(/[^0-9,]/g, ""))}
                placeholder="0"
                className="h-8 text-sm number-input"
              />
            </div>
            {withQuantity && (
              <div>
                <Label className="text-xs">{quantityLabel}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  placeholder="0"
                  className="h-8 text-sm number-input"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              placeholder="단위"
              className="h-8 text-sm w-20"
            />
            <Button size="sm" onClick={handleAdd} disabled={!newName.trim() || !newValue} className="h-8">
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
                setNewQty("");
              }}
              className="h-8"
            >
              취소
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="w-full border-dashed">
          <Plus className="h-4 w-4 mr-2" />
          항목 추가
        </Button>
      )}
    </div>
  );
}
