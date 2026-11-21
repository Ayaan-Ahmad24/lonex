"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { formatPhone, mailtoHref, telHref } from "@/lib/public/contact";
import {
  CATEGORIES,
  ENQUIRY,
  FORM,
  type EnquiryCategory,
} from "./content";

type Values = {
  name: string;
  email: string;
  phone: string;
  category: EnquiryCategory;
  subject: string;
  message: string;
};

type Errors = Partial<Record<keyof Values, string>>;

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "ready"; href: string; message: string }
  | { kind: "blocked"; href: string | null; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELD_ORDER: (keyof Values)[] = [
  "name",
  "email",
  "phone",
  "category",
  "subject",
  "message",
];

const INITIAL_VALUES: Values = {
  name: "",
  email: "",
  phone: "",
  category: "general",
  subject: "",
  message: "",
};

function validateField(field: keyof Values, values: Values): string | undefined {
  switch (field) {
    case "name":
      return values.name.trim().length < 2
        ? "Enter the name we should reply to."
        : undefined;
    case "email":
      return EMAIL_PATTERN.test(values.email.trim())
        ? undefined
        : "Enter an email address we can reply to.";
    case "phone":
      return values.phone.replace(/\D/g, "").length < 7
        ? "Enter a phone number with at least 7 digits."
        : undefined;
    case "category":
      return CATEGORIES.some((item) => item.id === values.category)
        ? undefined
        : "Choose an enquiry category.";
    case "subject":
      return values.subject.trim().length < 3
        ? "Add a short subject."
        : undefined;
    case "message":
      return values.message.trim().length < 10
        ? "Add a little more detail so we can prepare a useful reply."
        : undefined;
  }
}

function validate(values: Values): Errors {
  const errors: Errors = {};

  for (const field of FIELD_ORDER) {
    const error = validateField(field, values);

    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

function buildMessage(values: Values): string {
  const category =
    CATEGORIES.find((item) => item.id === values.category)?.label ?? "General";

  return [
    "Hello LONEX,",
    "",
    `Enquiry: ${category}`,
    `Name: ${values.name.trim()}`,
    `Phone: ${values.phone.trim()}`,
    `Email: ${values.email.trim()}`,
    `Subject: ${values.subject.trim()}`,
    "",
    "Message:",
    values.message.trim(),
  ].join("\n");
}

function fieldElementId(field: keyof Values): string {
  return field === "category" ? "category-solar" : field;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5 9.6 17 19 7.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 7.8v5.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.2" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Contact enquiry form.
 *
 * There is no contact endpoint or mail transport in this project, so the form
 * must not pretend to submit to one. It validates locally, composes a
 * structured message, and hands it to the configured enquiry email address via
 * a mailto: link. The success state only appears when the browser accepted the
 * new tab; a blocked popup is reported honestly with a copy fallback.
 */
export function EnquiryForm({
  email,
  phone,
}: {
  email: string;
  phone: string;
}) {
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [showMessage, setShowMessage] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">(
    "idle",
  );

  const statusRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<number | null>(null);
  const lastStatus = useRef<Status["kind"]>("idle");

  const working = status.kind === "working";
  const prepared =
    status.kind === "ready" || status.kind === "blocked"
      ? status.message
      : "";
  const tel = telHref(phone);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      (status.kind === "ready" || status.kind === "blocked") &&
      status.kind !== lastStatus.current
    ) {
      lastStatus.current = status.kind;
      const panel = statusRef.current;

      if (panel) {
        panel.focus({ preventScroll: true });
        panel.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "nearest",
        });
      }
    }

    if (status.kind === "idle") {
      lastStatus.current = "idle";
    }
  }, [status.kind]);

  const update = (field: keyof Values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }

    if (status.kind !== "idle") {
      setStatus({ kind: "idle" });
      setCopyState("idle");
      setShowMessage(false);
    }
  };

  const change = (
    field: keyof Values,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    update(field, event.target.value);
  };

  const blur = (field: keyof Values) => {
    const error = validateField(field, values);

    setErrors((current) => {
      const next = { ...current };

      if (error) {
        next[field] = error;
      } else {
        delete next[field];
      }

      return next;
    });
  };

  const reset = () => {
    setStatus({ kind: "idle" });
    setCopyState("idle");
    setShowMessage(false);
    document.getElementById("name")?.focus();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setCopyState("idle");

    if (Object.keys(nextErrors).length > 0) {
      setStatus({ kind: "idle" });
      const first = FIELD_ORDER.find((field) => nextErrors[field]);

      if (first) {
        document.getElementById(fieldElementId(first))?.focus();
      }

      return;
    }

    const message = buildMessage(values);
    const href = email ? mailtoHref(email, "General Enquiry — LONEX", message) : null;

    if (!href) {
      setStatus({ kind: "blocked", href: null, message });
      return;
    }

    // Open inside the submit gesture so a popup blocker cannot mistake this for
    // an unsolicited tab. The short working state covers the handoff.
    const opened = window.open(href, "_blank");

    if (opened) {
      try {
        opened.opener = null;
      } catch {
        // The tab is cross-origin; the opener cannot always be cleared here.
      }
    }

    setStatus({ kind: "working" });

    timer.current = window.setTimeout(() => {
      setStatus(
        opened
          ? { kind: "ready", href, message }
          : { kind: "blocked", href, message },
      );
    }, 450);
  };

  const copyMessage = async () => {
    if (!prepared) {
      return;
    }

    try {
      await navigator.clipboard.writeText(prepared);
      setCopyState("copied");
    } catch {
      setShowMessage(true);
      setCopyState("manual");
      window.setTimeout(() => {
        const element = messageRef.current;

        if (element) {
          element.focus();
          element.select();
        }
      }, 120);
    }
  };

  return (
    <form
      className="lxct-form"
      noValidate
      onSubmit={submit}
      aria-busy={working}
      data-form
    >
      <div className="lxct-form__head">
        <span>{FORM.sheetLabel}</span>
        <span>{FORM.sheetMeta}</span>
      </div>

      <div className="lxct-form__grid">
        <div className={`lxct-field${errors.name ? " has-error" : ""}`}>
          <label className="lxct-field__head" htmlFor="name">
            <span className="lxct-field__label">{FORM.fields.name.label}</span>
            <span className="lxct-field__index" aria-hidden="true">
              {FORM.fields.name.index}
            </span>
          </label>
          <input
            id="name"
            name="name"
            required
            type="text"
            className="lxct-input"
            autoComplete="name"
            placeholder={FORM.fields.name.placeholder}
            maxLength={80}
            value={values.name}
            onChange={(event) => change("name", event)}
            onBlur={() => blur("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            disabled={working}
          />
          {errors.name ? (
            <p className="lxct-field__error" id="name-error" data-field-error>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className={`lxct-field${errors.email ? " has-error" : ""}`}>
          <label className="lxct-field__head" htmlFor="email">
            <span className="lxct-field__label">
              {FORM.fields.email.label}
            </span>
            <span className="lxct-field__index" aria-hidden="true">
              {FORM.fields.email.index}
            </span>
          </label>
          <input
            id="email"
            name="email"
            required
            type="email"
            inputMode="email"
            className="lxct-input"
            autoComplete="email"
            placeholder={FORM.fields.email.placeholder}
            maxLength={120}
            value={values.email}
            onChange={(event) => change("email", event)}
            onBlur={() => blur("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={working}
          />
          {errors.email ? (
            <p className="lxct-field__error" id="email-error" data-field-error>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className={`lxct-field${errors.phone ? " has-error" : ""}`}>
          <label className="lxct-field__head" htmlFor="phone">
            <span className="lxct-field__label">
              {FORM.fields.phone.label}
            </span>
            <span className="lxct-field__index" aria-hidden="true">
              {FORM.fields.phone.index}
            </span>
          </label>
          <input
            id="phone"
            name="phone"
            required
            type="tel"
            inputMode="tel"
            className="lxct-input"
            autoComplete="tel"
            placeholder={FORM.fields.phone.placeholder}
            maxLength={32}
            value={values.phone}
            onChange={(event) => change("phone", event)}
            onBlur={() => blur("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            disabled={working}
          />
          {errors.phone ? (
            <p className="lxct-field__error" id="phone-error" data-field-error>
              {errors.phone}
            </p>
          ) : null}
        </div>

        <fieldset
          className={`lxct-field lxct-field--category${
            errors.category ? " has-error" : ""
          }`}
        >
          <legend className="lxct-field__head lxct-field__head--legend">
            <span className="lxct-field__label">
              {FORM.fields.category.label}
            </span>
            <span className="lxct-field__index" aria-hidden="true">
              {FORM.fields.category.index}
            </span>
          </legend>

          <div className="lxct-choices">
            {CATEGORIES.map((category) => {
              const active = values.category === category.id;

              return (
                <label
                  key={category.id}
                  className={`lxct-choice${active ? " is-active" : ""}`}
                >
                  <input
                    id={`category-${category.id}`}
                    type="radio"
                    name="category"
                    value={category.id}
                    className="lxct-choice__input"
                    required
                    checked={active}
                    onChange={() => update("category", category.id)}
                    disabled={working}
                  />
                  <span aria-hidden="true" className="lxct-choice__dot" />
                  <span className="lxct-choice__label">{category.label}</span>
                  <span className="lxct-choice__hint">{category.hint}</span>
                </label>
              );
            })}
          </div>

          {errors.category ? (
            <p
              className="lxct-field__error"
              id="category-error"
              data-field-error
            >
              {errors.category}
            </p>
          ) : null}
        </fieldset>

        <div
          className={`lxct-field lxct-field--wide${
            errors.subject ? " has-error" : ""
          }`}
        >
          <label className="lxct-field__head" htmlFor="subject">
            <span className="lxct-field__label">
              {FORM.fields.subject.label}
            </span>
            <span className="lxct-field__index" aria-hidden="true">
              {FORM.fields.subject.index}
            </span>
          </label>
          <input
            id="subject"
            name="subject"
            required
            type="text"
            className="lxct-input"
            autoComplete="off"
            placeholder={FORM.fields.subject.placeholder}
            maxLength={120}
            value={values.subject}
            onChange={(event) => change("subject", event)}
            onBlur={() => blur("subject")}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "subject-error" : undefined}
            disabled={working}
          />
          {errors.subject ? (
            <p
              className="lxct-field__error"
              id="subject-error"
              data-field-error
            >
              {errors.subject}
            </p>
          ) : null}
        </div>

        <div
          className={`lxct-field lxct-field--wide${
            errors.message ? " has-error" : ""
          }`}
        >
          <label className="lxct-field__head" htmlFor="message">
            <span className="lxct-field__label">
              {FORM.fields.message.label}
            </span>
            <span className="lxct-field__index" aria-hidden="true">
              {FORM.fields.message.index}
            </span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            className="lxct-input lxct-input--area"
            rows={5}
            placeholder={FORM.fields.message.placeholder}
            maxLength={1000}
            value={values.message}
            onChange={(event) => change("message", event)}
            onBlur={() => blur("message")}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            disabled={working}
          />
          {errors.message ? (
            <p
              className="lxct-field__error"
              id="message-error"
              data-field-error
            >
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="lxct-form__foot">
        <button
          type="submit"
          className="lxct-submit"
          data-submit
          disabled={working}
          aria-disabled={working}
        >
          {working ? (
            <>
              <span aria-hidden="true" className="lxct-spinner" />
              {FORM.working}
            </>
          ) : (
            <>
              {FORM.submit}
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
        <p className="lxct-form__note">{ENQUIRY.note}</p>
      </div>

      <div ref={statusRef} tabIndex={-1} className="lxct-status-region">
        {status.kind === "ready" ? (
          <div
            className="lxct-status lxct-status--ready"
            role="status"
            data-form-status
          >
            <span aria-hidden="true" className="lxct-status__icon">
              <CheckIcon />
            </span>
            <div className="lxct-status__copy">
              <p className="lxct-status__title">
                Your enquiry is ready to send by email.
              </p>
              <p className="lxct-status__body">
                Review the message there and press send. Nothing has been sent
                from this page.
              </p>
              <div className="lxct-status__actions">
                <a
                  href={status.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lxct-link"
                >
                  Open email again <span aria-hidden="true">↗</span>
                </a>
                <button type="button" onClick={copyMessage} className="lxct-link" data-copy>
                  {copyState === "copied" ? "Copied" : "Copy message"}
                </button>
                <button type="button" onClick={reset} className="lxct-link" data-reset>
                  Edit details
                </button>
              </div>
              {copyState === "manual" ? (
                <p className="lxct-status__hint">
                  The message is selected below. Copy it with your keyboard.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {status.kind === "blocked" ? (
          <div
            className="lxct-status lxct-status--blocked"
            role="alert"
            data-form-status
          >
            <span aria-hidden="true" className="lxct-status__icon">
              <AlertIcon />
            </span>
            <div className="lxct-status__copy">
              <p className="lxct-status__title">Email did not open.</p>
              <p className="lxct-status__body">
                {status.href
                  ? `Your browser blocked the new tab. Copy the prepared message and send it to the enquiry email, or open your email client with the link below.`
                  : `An email address is not configured on this site. Please use the contact form below or call ${formatPhone(phone)} to continue the enquiry.`}
              </p>
              <div className="lxct-status__actions">
                {status.href ? (
                  <a
                    href={status.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lxct-link"
                  >
                    Open email <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
                <button type="button" onClick={copyMessage} className="lxct-link" data-copy>
                  {copyState === "copied" ? "Copied" : "Copy message"}
                </button>
                {tel ? (
                  <a href={tel} className="lxct-link">
                    Call {formatPhone(phone)}
                  </a>
                ) : null}
                <button type="button" onClick={reset} className="lxct-link" data-reset>
                  Edit details
                </button>
              </div>
              {copyState === "manual" ? (
                <p className="lxct-status__hint">
                  The message is selected below. Copy it with your keyboard.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {prepared ? (
          <details
            className="lxct-prepared"
            open={showMessage}
            onToggle={(event) => setShowMessage(event.currentTarget.open)}
          >
            <summary>View the prepared message</summary>
            <textarea
              ref={messageRef}
              className="lxct-prepared__text"
              readOnly
              rows={9}
              value={prepared}
              aria-label="Prepared email message"
            />
          </details>
        ) : null}
      </div>
    </form>
  );
}

