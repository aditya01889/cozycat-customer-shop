import { ErrorType } from './error-types';

export const errorMessages: Record<ErrorType, { title: string; messages: string[]; recovery: string }> = {
  [ErrorType.NETWORK]: {
    title: "Connection Purr-oblems 🐾",
    messages: [
      "Our cat's internet connection is taking a nap!",
      "The server is playing hide and seek.",
      "Network connection is having a cat nap."
    ],
    recovery: "Check your internet connection and try again. Our kitchen is still open!"
  },
  [ErrorType.AUTHENTICATION]: {
    title: "Paws Authorization Needed 🐾",
    messages: [
      "Please sign in to continue your culinary journey.",
      "Your session has expired. Time for a fresh login!",
      "Meow! We need to know who you are."
    ],
    recovery: "Sign in to your account to access this feature."
  },
  [ErrorType.AUTHORIZATION]: {
    title: "Not Your Territory 🐾",
    messages: [
      "This area is for special cats only!",
      "You don't have permission to enter this kitchen.",
      "Sorry, this is a restricted area for our kitchen staff."
    ],
    recovery: "Contact an administrator if you need access to this area."
  },
  [ErrorType.VALIDATION]: {
    title: "Recipe Needs Adjustment 🐾",
    messages: [
      "Something doesn't taste quite right with that input.",
      "Please check your recipe details.",
      "The form needs a little more attention."
    ],
    recovery: "Review the highlighted fields and try again."
  },
  [ErrorType.NOT_FOUND]: {
    title: "Page Ran Away 🐾",
    messages: [
      "This page seems to have wandered off!",
      "The content you're looking for is hiding.",
      "Even our best cats can't find this page."
    ],
    recovery: "Check the URL or return to our main menu."
  },
  [ErrorType.SERVER_ERROR]: {
    title: "Kitchen Overheated 🐾",
    messages: [
      "Our kitchen is experiencing technical difficulties.",
      "The ovens are too hot right now!",
      "Something went wrong in our kitchen."
    ],
    recovery: "We're working on it! Please try again in a few moments."
  },
  [ErrorType.DATABASE]: {
    title: "Recipe Book Misplaced 🐾",
    messages: [
      "We can't find our recipe book right now.",
      "Database is taking a cat nap.",
      "Having trouble accessing our ingredients list."
    ],
    recovery: "Please try again. Our chefs are fixing the recipe book!"
  },
  [ErrorType.PAYMENT]: {
    title: "Payment Purr-oblems 🐾",
    messages: [
      "The payment processor is being finicky.",
      "Couldn't process your payment right meow.",
      "Payment gateway is taking a nap."
    ],
    recovery: "Check your payment details or try a different payment method."
  },
  [ErrorType.CART]: {
    title: "Cart Issues 🐾",
    messages: [
      "Your shopping cart is feeling lonely.",
      "Having trouble with your cart items.",
      "The cart needs some attention."
    ],
    recovery: "Review your cart or try adding items again."
  },
  [ErrorType.ORDER]: {
    title: "Order Complications 🐾",
    messages: [
      "Having trouble with your order.",
      "The order got stuck in the cat door.",
      "Order processing needs a retry."
    ],
    recovery: "Check your order details or contact support."
  },
  [ErrorType.PRODUCT]: {
    title: "Product MIA 🐾",
    messages: [
      "This product is hiding from us.",
      "Can't find the product details.",
      "Product information is unavailable."
    ],
    recovery: "Browse our other delicious products or try again later."
  },
  [ErrorType.PROFILE]: {
    title: "Profile Purr-oblems 🐾",
    messages: [
      "Having trouble with your profile.",
      "Profile update got stuck.",
      "Can't save your profile changes."
    ],
    recovery: "Check your profile information and try again."
  },
  [ErrorType.EMAIL]: {
    title: "Email Cat-astrophe 🐾",
    messages: [
      "Email service is taking a nap.",
      "Couldn't send your email right meow.",
      "Mail carrier is being lazy today."
    ],
    recovery: "Try again later or contact support directly."
  },
  [ErrorType.FILE_UPLOAD]: {
    title: "File Upload Issues 🐾",
    messages: [
      "File upload got stuck in the cat door.",
      "Having trouble with your file.",
      "Upload is taking longer than expected."
    ],
    recovery: "Check your file size and format, then try again."
  },
  [ErrorType.UNKNOWN]: {
    title: "Unexpected Cat-astrophe 🐾",
    messages: [
      "Something unexpected happened!",
      "Even our cats are confused.",
      "An unknown error occurred."
    ],
    recovery: "Try again or contact our support team for help."
  }
};

export const getRandomMessage = (type: ErrorType): string => {
  const messages = errorMessages[type].messages;
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getErrorInfo = (type: ErrorType) => {
  return errorMessages[type];
};
