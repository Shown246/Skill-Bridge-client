export type UserRole = "STUDENT" | "TUTOR" | "ADMIN";
export type UserStatus = "ACTIVE" | "BANNED";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type BookingAction = "CANCEL" | "COMPLETE" | "REVIEW";

export interface Pagination { page: number; pageSize: number; totalItems: number; totalPages: number }
export interface Success<T> { success: true; data: T }
export interface PaginatedSuccess<T> extends Success<T[]> { pagination: Pagination }
export interface User { id: string; name: string; email: string; emailVerified: boolean; image: string | null; phone: string | null; role: UserRole; status: UserStatus; createdAt: string; updatedAt: string }
export interface Category { id: string; name: string; slug: string; description: string | null; isActive: boolean; createdAt?: string; updatedAt?: string }
export interface TutorCategoryLink { tutorProfileId?: string; categoryId: string; category: Pick<Category, "id" | "name" | "slug"> }
export interface Tutor { id: string; userId: string; headline: string; bio: string; experienceYears: number; hourlyRate: string | number; currencyCode: string; approvalStatus: ApprovalStatus; rejectionReason?: string | null; approvedAt?: string | null; user: Pick<User, "id" | "name" | "image"> & Partial<Pick<User, "email" | "status">>; categories: TutorCategoryLink[]; averageRating: number; reviewCount: number; createdAt?: string; updatedAt?: string }
export interface PublicReview { id: string; bookingId: string; rating: number; comment: string; createdAt: string; student: { id: string; name: string; image: string | null } }
export interface TutorSlots { tutorId: string; timezone: "UTC"; hourlyRate: number; currencyCode: string; supportedDurations: number[]; slots: { startAt: string; endAtByDuration: Record<string, string> }[] }
export interface Review extends PublicReview { tutorProfileId?: string; studentId?: string }
export interface Booking { id: string; studentId: string; tutorProfileId: string; categoryId: string; startAt: string; endAt: string; durationMinutes: number; hourlyRateSnapshot: string; quotedPrice: string; currencyCode: string; note: string | null; status: BookingStatus; cancelledAt: string | null; cancelledById: string | null; cancellationReason: string | null; completedAt: string | null; createdAt: string; updatedAt: string; student?: { id: string; name: string; email?: string; image?: string | null }; tutorProfile?: Tutor; tutor?: Tutor; category?: Pick<Category, "id" | "name" | "slug">; review?: Review | null; allowedActions: BookingAction[]; allowedAdminTransitions?: BookingStatus[]; statusHistory?: { id: string; fromStatus?: BookingStatus; toStatus: BookingStatus; reason?: string | null; createdAt: string; actor?: { name: string; role: UserRole } }[] }
export interface WeeklyAvailability { id?: string; tutorProfileId?: string; dayOfWeek: number; startMinuteUtc: number; endMinuteUtc: number; isActive?: boolean; createdAt?: string; updatedAt?: string }
export interface AdminStats { totalStudents: number; totalTutors: number; activeBookings: number; totalCategories: number; averageTutorRating: number; averageHourlyRate: number }
