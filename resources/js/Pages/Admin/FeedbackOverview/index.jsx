import AdministratorLayout from '@/Layouts/AdministratorLayout';
import FeedbackOverviewContent from '@/Components/ui/FeedbackOverviewContent';

export default function AdminFeedbackOverview({ needsReview, allTopics }) {
    return (
        <AdministratorLayout>
            <FeedbackOverviewContent needsReview={needsReview} allTopics={allTopics} />
        </AdministratorLayout>
    );
}
