using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace Vector.Api.Data
{
    public static class DbContextExtensions
    {
        public static void AddOrUpdate<TEntity>(this DbContext context, params TEntity[] entities) where TEntity : class
        {
            if (entities == null || entities.Length == 0) return;

            var entityType = context.Model.FindEntityType(typeof(TEntity));
            if (entityType == null)
            {
                context.Set<TEntity>().AddRange(entities);
                return;
            }

            var primaryKey = entityType.FindPrimaryKey();
            if (primaryKey == null)
            {
                context.Set<TEntity>().AddRange(entities);
                return;
            }

            foreach (var entity in entities)
            {
                var keyValues = primaryKey.Properties
                    .Select(p => p.PropertyInfo != null 
                        ? p.PropertyInfo.GetValue(entity) 
                        : context.Entry(entity).Property(p.Name).CurrentValue)
                    .ToArray();

                // Check if any key value is the default value (e.g. Guid.Empty)
                var hasDefaultKey = keyValues.Any(val => val == null || val.Equals(GetDefaultValue(val.GetType())));

                if (hasDefaultKey)
                {
                    context.Set<TEntity>().Add(entity);
                }
                else
                {
                    var existing = context.Set<TEntity>().Find(keyValues);
                    if (existing != null)
                    {
                        context.Entry(existing).CurrentValues.SetValues(entity);
                    }
                    else
                    {
                        context.Set<TEntity>().Add(entity);
                    }
                }
            }
        }

        private static object? GetDefaultValue(Type type)
        {
            return type.IsValueType ? Activator.CreateInstance(type) : null;
        }
    }
}
