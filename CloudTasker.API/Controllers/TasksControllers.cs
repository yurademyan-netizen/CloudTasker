using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CloudTasker.API.Data;
using CloudTasker.API.Models;
using TaskStatus = CloudTasker.API.Models.TaskStatus; // Уточнюємо, що це наш Enum

namespace CloudTasker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: Отримати ВСІ задачі
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] TaskStatus? status, [FromQuery] TaskPriority? priority)
        {
            var query = _context.Tasks.AsQueryable();

            if (status.HasValue) query = query.Where(t => t.Status == status.Value);
            if (priority.HasValue) query = query.Where(t => t.Priority == priority.Value);

            var tasks = await query.ToListAsync();
            return Ok(tasks);
        }

        // 2. GET: Отримати ОДНУ задачу по ID (ОСЬ ЦЬОГО НЕ ВИСТАЧАЛО!)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound("Задачу не знайдено");
            return Ok(task);
        }

        // 3. POST: Створити
        [HttpPost]
        public async Task<IActionResult> Create(TaskItem task)
        {
            task.CreatedAt = DateTime.UtcNow;
            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        // 4. DELETE: Видалити
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // 5. PUT: Оновити
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, TaskItem updatedTask)
        {
            if (id != updatedTask.Id) return BadRequest();

            var existingTask = await _context.Tasks.FindAsync(id);
            if (existingTask == null) return NotFound();

            existingTask.Title = updatedTask.Title;
            existingTask.Description = updatedTask.Description;
            existingTask.Priority = updatedTask.Priority;
            existingTask.Status = updatedTask.Status;
            existingTask.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent(); 
        }
    }
}