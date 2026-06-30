from pydantic import BaseModel, EmailStr, Field, field_validator
import re

# Industry Standard Regex Patterns
USERNAME_REGEX = r"^[a-zA-Z0-9_-]{3,20}$"
# Enforces: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"

class UserCreate(BaseModel):
    username: str = Field(..., description="Username must be 3-20 characters and alphanumeric.")
    email: EmailStr = Field(..., description="Must be a valid email format.")
    full_name: str = Field(..., min_length=1, description="Full name cannot be blank.")
    password: str = Field(..., description="Password must meet corporate complexity standards.")
    role: str = Field("operator", description="Default application role.")

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if not re.match(USERNAME_REGEX, value):
            raise ValueError(
                "Username must be between 3 and 20 characters long and contain "
                "only alphanumeric characters, underscores, or hyphens."
            )
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not re.match(PASSWORD_REGEX, value):
            raise ValueError(
                "Password must be at least 8 characters long, contain at least one uppercase letter, "
                "one lowercase letter, one numeric digit, and one special character (@$!%*?&)."
            )
        return value

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class MFARequest(BaseModel):
    username: str
    code: str = Field(..., min_length=6, max_length=6, description="6-digit verification code.")

    @field_validator("code")
    @classmethod
    def validate_mfa_code(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("MFA verification code must consist entirely of numeric digits.")
        return value