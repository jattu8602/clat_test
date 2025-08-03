import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ListChecks, Clock, Plus, Minus } from 'lucide-react'

export default function TestCard({
  title,
  description,
  isPaid,
  thumbnailUrl = '/test.jpeg',
  highlights = [],
  durationMinutes,
  numberOfQuestions,
  positiveMarks = 1,
  negativeMarks = 0.25,
}) {
  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-50">
      <div className="relative w-full h-48">
        <Image
          src={thumbnailUrl || '/placeholder.svg'}
          alt={`Thumbnail for ${title}`}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <Badge variant={isPaid ? 'default' : 'secondary'}>
            {isPaid ? 'Paid' : 'Free'}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {highlights.length > 0 && (
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 dark:text-gray-300">
            {highlights.slice(0, 4).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>{durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <ListChecks className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>{numberOfQuestions} questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Plus className="w-4 h-4 text-green-500" />
            <span>{positiveMarks} marks</span>
          </div>
          <div className="flex items-center gap-1">
            <Minus className="w-4 h-4 text-red-500" />
            <span>{negativeMarks} marks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
