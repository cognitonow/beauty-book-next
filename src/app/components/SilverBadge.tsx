import { Award } from 'lucide-react';

const SilverBadge = () => {
  return (
    <div className="inline-flex items-center rounded-full border-2 border-slate-300 bg-white p-2.5 shadow-lg">
      <div className="mr-2.5">
        <Award className="h-7 w-7 text-slate-400" />
      </div>
      <div className="text-base font-bold text-slate-600">
        Experienced: Gel Manicure
      </div>
    </div>
  );
};

export default SilverBadge;
