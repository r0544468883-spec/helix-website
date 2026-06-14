import { SITE } from '@/lib/site';
import WorkshopRegistrationForm from '../components/WorkshopRegistrationForm';

export default function RegistrationForm() {
  return (
    <WorkshopRegistrationForm
      endpoint="/api/vibe-code-register"
      whatsappGroup={SITE.vibeCodeWhatsappGroup}
    />
  );
}
