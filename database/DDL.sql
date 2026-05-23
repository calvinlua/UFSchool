CREATE TABLE IF NOT EXISTS teachers (
  id         INT UNSIGNED    AUTO_INCREMENT,
  email      VARCHAR(255)    NOT NULL,
  name       VARCHAR(255)    NOT NULL,
  created_at TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_teachers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS students (
  id         INT UNSIGNED    AUTO_INCREMENT,
  email      VARCHAR(255)    NOT NULL,
  name       VARCHAR(255)    NOT NULL,
  created_at TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_students_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS classes (
  id         INT UNSIGNED    AUTO_INCREMENT,
  class_code VARCHAR(255)    NOT NULL,
  class_name VARCHAR(255)    NOT NULL,
  created_at TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_classes_class_code (class_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subjects (
  id           INT UNSIGNED    AUTO_INCREMENT,
  subject_code VARCHAR(255)    NOT NULL,
  subject_name VARCHAR(255)    NOT NULL,
  created_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_subjects_subject_code (subject_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Each row represents a teacher teaching a student a subject in a class.
-- toDelete=1 in the CSV removes the matching row here.
CREATE TABLE IF NOT EXISTS teaching_assignments (
  teacher_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  class_id   INT UNSIGNED NOT NULL,
  subject_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (teacher_id, student_id, class_id, subject_id),
  CONSTRAINT fk_ta_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  CONSTRAINT fk_ta_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_ta_class   FOREIGN KEY (class_id)   REFERENCES classes(id)  ON DELETE CASCADE,
  CONSTRAINT fk_ta_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  INDEX idx_ta_class_id   (class_id),
  INDEX idx_ta_teacher_id (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
