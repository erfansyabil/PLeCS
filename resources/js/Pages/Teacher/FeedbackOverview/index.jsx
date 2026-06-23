import TeacherLayout from '@/Layouts/TeacherLayout';
import FeedbackOverviewContent from '@/Components/ui/FeedbackOverviewContent';

export default function TeacherFeedbackOverview({ needsReview, allTopics }) {
    return (
        <TeacherLayout>
            <FeedbackOverviewContent needsReview={needsReview} allTopics={allTopics} />
        </TeacherLayout>
    );
}
