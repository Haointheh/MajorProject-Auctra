import { useState } from "react";
import SignupStep1 from "./SignupStep1";
import SignupStep2 from "./SignupStep2";

export default function SignupFlow({ onClose, switchToLogin }) {
    const [step, setStep] =useState(1);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",

        dob: "",
        address: "",
        documentType: "",

        frontImage: null,
        backImage: null,
    });

    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const nextStep = () => {
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        setStep(2);
    };

    const previousStep = () => {
        setStep(1);
    };

    const handleSignup = () => {
        console.log(formData);

        // Backend API later
    };

    return (
        <>
            {step === 1 ? (
                <SignupStep1
                    onClose={onClose}
                    switchToLogin={switchToLogin}
                    formData={formData}
                    updateField={updateField}
                    nextStep={nextStep}
                />
            ) : (
                <SignupStep2
                    onClose={onClose}
                    previousStep={previousStep}
                    formData={formData}
                    updateField={updateField}
                    handleSignup={handleSignup}
                />
            )}
        </>
    );
}