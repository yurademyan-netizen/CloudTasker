using System.ComponentModel.DataAnnotations;

namespace CloudTasker.API.Models
{
    // 1. Виносимо статуси та пріоритети в Enums
    public enum TaskPriority
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum TaskStatus
    {
        ToDo,
        InProgress,
        Done
    }

    public class TaskItem
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Назва завдання є обов'язковою")]
        [MaxLength(100, ErrorMessage = "Назва занадто довга (макс. 100 символів)")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        // Використовуємо Enum замість string
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;

        public TaskStatus Status { get; set; } = TaskStatus.ToDo;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Корисно також додати дату оновлення
        public DateTime? UpdatedAt { get; set; }
    }
}