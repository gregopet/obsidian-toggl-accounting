// Declarations created using https://app.quicktype.io/
export interface Me {
	id:                   number;
	api_token:            string;
	email:                string;
	fullname:             string;
	timezone:             string;
	default_workspace_id: number;
	beginning_of_week:    number;
	image_url:            string;
	created_at:           string;
	updated_at:           string;
	openid_email:         null;
	openid_enabled:       boolean;
	country_id:           number;
	at:                   string;
	intercom_hash:        string;
	has_password:         boolean;
}

export interface Project {
	id:                   number;
	workspace_id:         number;
	client_id:            number;
	name:                 string;
	is_private:           boolean;
	active:               boolean;
	at:                   string;
	created_at:           string;
	server_deleted_at:    null;
	color:                string;
	billable:             null;
	template:             null;
	auto_estimates:       null;
	estimated_hours:      null;
	rate:                 null;
	rate_last_updated:    null;
	currency:             null;
	recurring:            boolean;
	recurring_parameters: null;
	current_period:       null;
	fixed_fee:            null;
	actual_hours:         number;
	wid:                  number;
	cid:                  number;
}

export interface Tag {
	id:           number;
	workspace_id: number;
	name:         string;
	at:           string;
}

/** Structure for filters we can apply when requesting detailed reports */
export interface DetailedReportQuery {
	start_date: string;
	end_date: string
	/** Order by field, optional, default "date". Can be "date", "user", "duration", "description" or "last_update". */
	order_by?: "date" | "user" | "duration" | "description" | "last_update";
	billable?: boolean
	client_ids?: number[]
	description?: string
	first_id?: number;
	first_row_number?: number;
	first_timestamp?: number;
	group_ids?: number[];
	grouped?: boolean;
	hide_amounts?: boolean;
	max_duration_seconds?: number;
	min_duration_seconds?: number;
	order_dir?: "ASC" | "DESC";
	postedFields?: string[];
	project_ids?: number[]
	rounding?: number;
	rounding_minutes?: number;
	startTime?: string;
	tag_ids?: number[];
	task_ids?: number[];
	time_entry_ids?: number[];
	user_ids?: number[];
}

export interface DetailedReport {
	user_id:                  number;
	username:                 string;
	project_id:               number | null;
	task_id:                  null;
	billable:                 boolean;
	description:              string;
	tag_ids:                  number[];
	billable_amount_in_cents: null;
	hourly_rate_in_cents:     null;
	currency:                 string;
	time_entries:             TimeEntryTemporal[];
	row_number:               number;
}

export interface TimeEntryTemporal {
	id:      number;
	seconds: number;
	start:   string;
	stop:    string;
	at:      string;
}

/** Splatted DetailedReport & TimeEntry */
export interface TimeEntry extends Omit<DetailedReport, "time_entries">, TimeEntryTemporal { }

export interface UpdateTimeEntry {
	billable?: boolean;
	/** Must be provided when creating a time entry and should identify the service/application used to create it */
	created_with?: string;
	description?: string;
	/** Time entry duration. For running entries should be -1 * (Unix start time) */
	duration?: number;
	/** Used to create a time entry with a duration but without a stop time */
	duronly?: boolean;
	project_id?: number;
	start?: string;
	start_date?: string;
	/** Stop time in UTC, can be omitted if it's still running or created with "duration" and "duronly" fields */
	stop?: string;
	tag_action?: "add" | "remove";
	tag_ids?: number[];
	/** Names of tags to add/remove. If name does not exist as tag, one will be created automatically */
	tags?: string[];
	task_id?: number;
	/** Time Entry creator ID, if omitted will use the requester user ID */
	user_id?: number;
	workspace_id?: number;
}

export interface RunningTimeEntry extends UpdateTimeEntry{
	id: number;
}
