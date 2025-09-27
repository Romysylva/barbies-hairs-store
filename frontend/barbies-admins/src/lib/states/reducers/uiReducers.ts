import { UIState, UIAction } from "../types";
import { generateId } from "@/lib/utils";

// =============================================================================
// UI REDUCER
// =============================================================================

export const initialUIState: UIState = {
  theme: "system",
  sidebar: {
    isOpen: false,
    activeSection: undefined,
  },
  modals: {},
  toasts: [],
  loading: {},
  breadcrumbs: [],
  pageTitle: "E-commerce Store",
  metaDescription: undefined,
};

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_THEME":
      return {
        ...state,
        theme: action.payload.theme,
      };

    case "TOGGLE_SIDEBAR":
      const section = action.payload?.section;
      const isCurrentSectionActive = state.sidebar.activeSection === section;

      return {
        ...state,
        sidebar: {
          isOpen:
            section && !isCurrentSectionActive ? true : !state.sidebar.isOpen,
          activeSection:
            section && !isCurrentSectionActive
              ? section
              : state.sidebar.isOpen
                ? undefined
                : state.sidebar.activeSection,
        },
      };

    case "OPEN_MODAL":
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modalKey]: {
            isOpen: true,
            data: action.payload.data,
          },
        },
      };

    case "CLOSE_MODAL":
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modalKey]: {
            isOpen: false,
            data: undefined,
          },
        },
      };

    case "ADD_TOAST": {
      const toast = {
        ...action.payload.toast,
        id: generateId("toast"),
        timestamp: Date.now(),
      };

      return {
        ...state,
        toasts: [...state.toasts, toast],
      };
    }

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter(
          (toast) => toast.id !== action.payload.toastId
        ),
      };

    case "CLEAR_ALL_TOASTS":
      return {
        ...state,
        toasts: [],
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.isLoading,
        },
      };

    case "SET_BREADCRUMBS":
      return {
        ...state,
        breadcrumbs: action.payload.breadcrumbs,
      };

    case "SET_PAGE_META":
      return {
        ...state,
        pageTitle: action.payload.title,
        metaDescription: action.payload.description,
      };

    default:
      return state;
  }
}
