import { AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

import { usePerformLogout, useSellers } from "@hooks/api";
import { ElaiOnboardingShell } from "./elai-onboarding-shell";
import { useOnboarding } from "./hooks/use-onboarding";
import { AddressStep } from "./steps/address-step";
import { CompanyStep } from "./steps/company-step";
import { PaymentStep } from "./steps/payment-step";
import { StoreStep } from "./steps/store-step";
import { WizardStep } from "./wizard-step";

type OnboardingWizardProps = {
  memberEmail: string;
};

export const OnboardingWizard = ({ memberEmail }: OnboardingWizardProps) => {
  const navigate = useNavigate();
  const performLogout = usePerformLogout();
  const { seller_members } = useSellers();
  const hasStores = (seller_members?.length ?? 0) > 0;

  const {
    currentStep,
    sellerId,
    isPending,
    goBack,
    submitStoreStep,
    submitAddressStep,
    skipAddressStep,
    submitCompanyStep,
    skipCompanyStep,
    submitPaymentStep,
    skipPaymentStep,
  } = useOnboarding(memberEmail);

  const handleBack = async () => {
    if (currentStep === 0) {
      if (hasStores) {
        navigate("/store-select", { replace: true });
      } else {
        await performLogout();
      }
    } else {
      goBack();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WizardStep key="store">
            <StoreStep onSubmit={submitStoreStep} isPending={isPending} />
          </WizardStep>
        );
      case 1:
        return (
          <WizardStep key="address">
            <AddressStep
              onSubmit={submitAddressStep}
              onSkip={skipAddressStep}
              isPending={isPending}
            />
          </WizardStep>
        );
      case 2:
        return (
          <WizardStep key="company">
            <CompanyStep
              onSubmit={submitCompanyStep}
              onSkip={skipCompanyStep}
              isPending={isPending}
            />
          </WizardStep>
        );
      case 3:
        return (
          <WizardStep key="payment">
            <PaymentStep
              sellerId={sellerId!}
              onSubmit={submitPaymentStep}
              onSkip={skipPaymentStep}
              isPending={isPending}
            />
          </WizardStep>
        );
      default:
        return null;
    }
  };

  return (
    <ElaiOnboardingShell
      currentStep={currentStep}
      showSteps
      showBack
      onBack={handleBack}
    >
      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
    </ElaiOnboardingShell>
  );
};
