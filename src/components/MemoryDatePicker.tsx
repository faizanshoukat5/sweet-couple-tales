import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface MemoryDatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const MemoryDatePicker = ({ date, onDateChange }: MemoryDatePickerProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">When did this happen? *</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => selectedDate && onDateChange(selectedDate)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MemoryDatePicker;